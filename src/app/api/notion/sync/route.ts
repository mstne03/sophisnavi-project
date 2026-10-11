import { createNotionGateway, DEFAULT_DATA_SOURCE_ID } from "@/infrastructure/notion/gateway";
import { syncContent } from "@/infrastructure/notion/sync";
import { triggerDeployHook } from "@/infrastructure/notion/webhook";
import { content } from "../../../content";

// Red de seguridad del webhook (ADR-0007): la ejecuta el cron de Vercel (vercel.json) y se puede llamar a mano con el
// mismo secreto. Vercel manda `Authorization: Bearer <CRON_SECRET>` si la variable existe; sin ella, 503 como el webhook.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ ok: false, reason: "cron not configured" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const [builtAt, sections, home, articles] = await Promise.all([content.snapshotAt(), content.listSections(), content.getHome(), content.listArticles()]);
  const intros = await Promise.all(sections.map((s) => content.getSection(s.slug)));
  const builtIds = new Set([home?.id, ...intros.map((s) => s?.intro?.id), ...articles.map((a) => a.id)].filter((id): id is string => !!id));

  const result = await syncContent({
    gateway: createNotionGateway(process.env.NOTION_TOKEN ?? ""),
    dataSourceId: process.env.NOTION_DATA_SOURCE_ID ?? DEFAULT_DATA_SOURCE_ID,
    builtAt,
    builtIds,
    deploy: () => triggerDeployHook(process.env.VERCEL_DEPLOY_HOOK_URL),
    log: console.log,
  });
  return Response.json({ ok: true, builtAt, ...result });
}
