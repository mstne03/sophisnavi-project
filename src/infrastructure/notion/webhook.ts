import { verifyWebhookSignature } from "@notionhq/client";
import { shouldDeploy, type WebhookEventLike } from "@/application/content/publishDecision";
import type { NotionGateway } from "./gateway";

export type WebhookDeps = {
  verificationToken: string | undefined; // NOTION_WEBHOOK_SECRET
  gateway: NotionGateway;
  deploy: () => Promise<boolean>; // POST al Deploy Hook de Vercel; false = Vercel lo rechazó por saturación (429)
  log?: (msg: string) => void;
};

export type WebhookResult = { status: number; body: { ok: boolean; deployed?: boolean; reason?: string } };

// Recibe un evento de Notion y, si afecta a lo publicado, dispara un build (ADR-0007).
// 1) Alta de la suscripción: Notion manda {verification_token} sin firma; se registra en los logs para copiarlo a Vercel.
// 2) Eventos: firma HMAC-SHA256 del cuerpo crudo con ese token; sin firma válida, 401 y nada más.
export async function handleNotionWebhook(rawBody: string, signature: string | null, deps: WebhookDeps): Promise<WebhookResult> {
  const log = deps.log ?? (() => {});
  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return { status: 400, body: { ok: false, reason: "invalid json" } };
  }
  if (isVerification(json)) {
    log(`notion-webhook: verification_token recibido: ${json.verification_token}`);
    return { status: 200, body: { ok: true } };
  }
  if (!deps.verificationToken) return { status: 503, body: { ok: false, reason: "webhook not configured" } };
  if (!(await verifyWebhookSignature({ body: rawBody, signature, verificationToken: deps.verificationToken }))) {
    return { status: 401, body: { ok: false, reason: "bad signature" } };
  }
  if (!isEvent(json)) return { status: 400, body: { ok: false, reason: "invalid event" } };

  const page = json.entity.type === "page" ? await deps.gateway.getPageState(json.entity.id) : null;
  const deploy = shouldDeploy(json, page);
  log(`notion-webhook: ${json.type} ${json.entity.id} estado=${page?.status ?? "-"} → ${deploy ? "deploy" : "ignorado"}`);
  if (!deploy) return { status: 200, body: { ok: true, deployed: false } };
  // Saturación del hook (ráfaga de ediciones): se responde 200 para que Notion no dé la suscripción por rota. El contenido
  // se lee en el build, así que los builds ya en cola lo recogen; lo que quede, lo recoge la sincronización programada.
  if (!(await deps.deploy())) {
    log("notion-webhook: Deploy Hook saturado (429), el cambio lo recogerá un build posterior o la sincronización diaria");
    return { status: 200, body: { ok: true, deployed: false, reason: "deploy hook rate limited" } };
  }
  return { status: 200, body: { ok: true, deployed: true } };
}

const isVerification = (j: unknown): j is { verification_token: string } =>
  typeof j === "object" && j !== null && typeof (j as { verification_token?: unknown }).verification_token === "string";

const isEvent = (j: unknown): j is WebhookEventLike => {
  if (typeof j !== "object" || j === null) return false;
  const e = j as { type?: unknown; entity?: { id?: unknown; type?: unknown } };
  return typeof e.type === "string" && typeof e.entity?.id === "string" && typeof e.entity?.type === "string";
};

// true = build lanzado; false = Vercel respondió 429 (límite de disparos por hora). Cualquier otro error, lanza.
export async function triggerDeployHook(url: string | undefined): Promise<boolean> {
  if (!url) throw new Error("VERCEL_DEPLOY_HOOK_URL no configurada");
  const res = await fetch(url, { method: "POST" });
  if (res.status === 429) return false;
  if (!res.ok) throw new Error(`Deploy Hook respondió ${res.status}`);
  return true;
}
