import { signWebhookPayload } from "@notionhq/client";
import { describe, expect, it, vi } from "vitest";
import type { NotionGateway } from "./gateway";
import { handleNotionWebhook, triggerDeployHook, type WebhookDeps } from "./webhook";

const TOKEN = "secret_test";
const event = (type: string, extra: object = {}) => JSON.stringify({ type, entity: { id: "p1", type: "page" }, data: { parent: { id: "db", type: "database" }, ...extra } });

function deps(status: string | null = "Publicado"): WebhookDeps & { deployed: number; logs: string[] } {
  const d = {
    verificationToken: TOKEN,
    gateway: { getPageState: async () => (status === null ? null : { inTrash: false, status, statusPropertyId: "O2dmOw" }) } as unknown as NotionGateway,
    deployed: 0,
    logs: [] as string[],
    deploy: async () => {
      d.deployed += 1;
    },
    log: (m: string) => d.logs.push(m),
  };
  return d;
}

// Protege: sin firma válida nunca se despliega (el endpoint es público); con firma, solo si el evento afecta a lo publicado.
describe("handleNotionWebhook", () => {
  it("acepta el alta de la suscripción y deja el token en los logs", async () => {
    const d = deps();
    const r = await handleNotionWebhook(JSON.stringify({ verification_token: "secret_abc" }), null, d);
    expect(r).toEqual({ status: 200, body: { ok: true } });
    expect(d.logs[0]).toContain("secret_abc");
    expect(d.deployed).toBe(0);
  });

  it("rechaza cuerpos que no son JSON, firmas ausentes o incorrectas, y no despliega", async () => {
    const d = deps();
    expect((await handleNotionWebhook("{nope", null, d)).status).toBe(400);
    expect((await handleNotionWebhook(event("page.content_updated"), null, d)).status).toBe(401);
    expect((await handleNotionWebhook(event("page.content_updated"), "sha256=00", d)).status).toBe(401);
    const body = event("page.content_updated");
    const signedOther = await signWebhookPayload({ body, verificationToken: "otro" });
    expect((await handleNotionWebhook(body, signedOther, d)).status).toBe(401);
    expect(d.deployed).toBe(0);
  });

  it("responde 503 si el secreto aún no está configurado", async () => {
    const d = { ...deps(), verificationToken: undefined };
    expect((await handleNotionWebhook(event("page.content_updated"), "sha256=x", d)).status).toBe(503);
  });

  it("con firma válida despliega solo cuando el cambio afecta a lo publicado", async () => {
    const d = deps("Publicado");
    const body = event("page.content_updated");
    const sig = await signWebhookPayload({ body, verificationToken: TOKEN });
    expect(await handleNotionWebhook(body, sig, d)).toEqual({ status: 200, body: { ok: true, deployed: true } });
    expect(d.deployed).toBe(1);

    const draft = deps("En proceso");
    expect((await handleNotionWebhook(body, sig, draft)).body.deployed).toBe(false);
    expect(draft.deployed).toBe(0);

    const gone = deps(null);
    expect((await handleNotionWebhook(body, sig, gone)).body.deployed).toBe(true);
  });

  it("rechaza un JSON firmado que no tiene forma de evento", async () => {
    const body = JSON.stringify({ hola: 1 });
    const sig = await signWebhookPayload({ body, verificationToken: TOKEN });
    expect((await handleNotionWebhook(body, sig, deps())).status).toBe(400);
  });
});

describe("triggerDeployHook", () => {
  it("hace POST a la URL y falla si no está configurada o Vercel responde error", async () => {
    const fetchMock = vi.fn(async () => new Response("", { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    await triggerDeployHook("https://api.vercel.com/v1/integrations/deploy/x/y");
    expect(fetchMock).toHaveBeenCalledWith("https://api.vercel.com/v1/integrations/deploy/x/y", { method: "POST" });
    await expect(triggerDeployHook(undefined)).rejects.toThrow(/no configurada/);
    vi.stubGlobal("fetch", async () => new Response("", { status: 500 }));
    await expect(triggerDeployHook("https://x")).rejects.toThrow(/500/);
    vi.unstubAllGlobals();
  });
});
