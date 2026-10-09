// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

afterEach(() => vi.unstubAllEnvs());

// Protege: la ruta pasa el cuerpo crudo y la cabecera de firma al manejador y devuelve su estado.
describe("POST /api/notion/webhook", () => {
  it("acepta el alta de la suscripción sin secreto configurado", async () => {
    vi.stubEnv("NOTION_WEBHOOK_SECRET", "");
    const res = await POST(new Request("http://x/api/notion/webhook", { method: "POST", body: JSON.stringify({ verification_token: "secret_1" }) }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("responde 503 a un evento si el secreto no está configurado y 401 si la firma no vale", async () => {
    vi.stubEnv("NOTION_WEBHOOK_SECRET", "");
    const body = JSON.stringify({ type: "page.content_updated", entity: { id: "p", type: "page" } });
    expect((await POST(new Request("http://x", { method: "POST", body }))).status).toBe(503);
    vi.stubEnv("NOTION_WEBHOOK_SECRET", "secret");
    expect((await POST(new Request("http://x", { method: "POST", body, headers: { "x-notion-signature": "sha256=00" } }))).status).toBe(401);
  });
});
