// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const listPages = vi.fn();
vi.mock("@/infrastructure/notion/gateway", () => ({ DEFAULT_DATA_SOURCE_ID: "ds", createNotionGateway: () => ({ listPages }) }));
const hook = vi.fn(async () => true);
vi.mock("@/infrastructure/notion/webhook", () => ({ triggerDeployHook: () => hook() }));

import { GET } from "./route";

const req = (auth?: string) => new Request("http://x/api/notion/sync", { headers: auth ? { authorization: auth } : {} });

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

// Protege: la ruta exige el secreto del cron, compara Notion con el snapshot desplegado y solo entonces lanza el build.
describe("GET /api/notion/sync", () => {
  it("responde 503 sin secreto configurado y 401 con uno incorrecto", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect((await GET(req("Bearer x"))).status).toBe(503);
    vi.stubEnv("CRON_SECRET", "s3cret");
    expect((await GET(req())).status).toBe(401);
    expect((await GET(req("Bearer otro"))).status).toBe(401);
    expect(hook).not.toHaveBeenCalled();
  });

  it("con el secreto, lanza un build solo si una página del snapshot cambió después de generarse", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    // El fixture se generó el 2026-01-01; «el-mundo-de-avatar» es uno de sus artículos.
    listPages.mockResolvedValueOnce([{ id: "el-mundo-de-avatar", status: "En proceso", inTrash: false, updatedAt: "2026-01-02T00:00:00.000Z" }]);
    const res = await GET(req("Bearer s3cret"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, builtAt: "2026-01-01T00:00:00.000Z", stale: ["el-mundo-de-avatar"], deployed: true });
    expect(hook).toHaveBeenCalledTimes(1);

    listPages.mockResolvedValueOnce([{ id: "el-mundo-de-avatar", status: "Publicado", inTrash: false, updatedAt: "2025-12-31T00:00:00.000Z" }]);
    expect(await (await GET(req("Bearer s3cret"))).json()).toMatchObject({ stale: [], deployed: false });
    expect(hook).toHaveBeenCalledTimes(1);
  });
});
