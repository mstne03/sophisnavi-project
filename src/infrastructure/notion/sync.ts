import { stalePages } from "@/application/content/publishDecision";
import type { NotionGateway } from "./gateway";

export type SyncDeps = {
  gateway: NotionGateway;
  dataSourceId: string;
  builtAt: string; // generatedAt del snapshot desplegado
  builtIds: ReadonlySet<string>; // páginas (artículos, intros, home) que contiene
  deploy: () => Promise<boolean>; // triggerDeployHook
  log?: (msg: string) => void;
};

export type SyncResult = { stale: string[]; deployed: boolean };

// Sincronización programada (ADR-0007): compara Notion con el despliegue actual y lanza un build solo si hay cambios que
// el webhook no llegó a publicar. Idempotente: si no hay nada desfasado no gasta ningún build.
export async function syncContent(deps: SyncDeps): Promise<SyncResult> {
  const log = deps.log ?? (() => {});
  const pages = await deps.gateway.listPages(deps.dataSourceId);
  const stale = stalePages(pages, deps.builtAt, deps.builtIds).map((p) => p.id);
  if (stale.length === 0) {
    log(`notion-sync: al día (snapshot de ${deps.builtAt})`);
    return { stale, deployed: false };
  }
  log(`notion-sync: ${stale.length} página(s) cambiadas desde ${deps.builtAt} sin publicar: ${stale.join(", ")}`);
  const deployed = await deps.deploy();
  log(deployed ? "notion-sync: build lanzado" : "notion-sync: Deploy Hook saturado, se reintentará en la próxima ejecución");
  return { stale, deployed };
}
