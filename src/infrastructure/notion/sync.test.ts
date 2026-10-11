import { describe, expect, it } from "vitest";
import type { NotionGateway } from "./gateway";
import type { NotionPage } from "./mapPage";
import { syncContent } from "./sync";

const page = (id: string, updatedAt: string, status = "Publicado"): NotionPage =>
  ({ id, title: id, status, statusPropertyId: "x", kind: "article", section: "pandora", slug: id, description: "", createdAt: updatedAt, updatedAt, inTrash: false }) as NotionPage;

function deps(pages: NotionPage[], hookOk = true) {
  const d = {
    gateway: { listPages: async () => pages } as unknown as NotionGateway,
    dataSourceId: "ds",
    builtAt: "2026-10-11T14:30:00.000Z",
    builtIds: new Set(["a"]),
    deployed: 0,
    logs: [] as string[],
    deploy: async () => {
      d.deployed += 1;
      return hookOk;
    },
    log: (m: string) => d.logs.push(m),
  };
  return d;
}

// Protege: la sincronización solo lanza un build cuando Notion tiene cambios posteriores al despliegue que afectan a lo publicado.
describe("syncContent", () => {
  it("no gasta builds si todo está al día", async () => {
    const d = deps([page("a", "2026-10-11T14:00:00.000Z"), page("borrador", "2026-10-11T15:00:00.000Z", "En proceso")]);
    expect(await syncContent(d)).toEqual({ stale: [], deployed: false });
    expect(d.deployed).toBe(0);
    expect(d.logs[0]).toContain("al día");
  });

  it("lanza un build si hay páginas publicadas editadas después del snapshot", async () => {
    const d = deps([page("a", "2026-10-11T14:56:00.000Z"), page("b", "2026-10-11T15:00:00.000Z")]);
    expect(await syncContent(d)).toEqual({ stale: ["a", "b"], deployed: true });
    expect(d.deployed).toBe(1);
  });

  it("si el Deploy Hook está saturado lo deja para la próxima ejecución", async () => {
    const d = deps([page("a", "2026-10-11T14:56:00.000Z")], false);
    expect(await syncContent(d)).toEqual({ stale: ["a"], deployed: false });
    expect(d.logs.at(-1)).toContain("saturado");
  });
});
