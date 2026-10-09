import { verifyWebhookSignature } from "@notionhq/client";
import { shouldDeploy, type WebhookEventLike } from "@/application/content/publishDecision";
import type { NotionGateway } from "./gateway";

export type WebhookDeps = {
  verificationToken: string | undefined; // NOTION_WEBHOOK_SECRET
  gateway: NotionGateway;
  deploy: () => Promise<void>; // POST al Deploy Hook de Vercel
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
  if (deploy) await deps.deploy();
  return { status: 200, body: { ok: true, deployed: deploy } };
}

const isVerification = (j: unknown): j is { verification_token: string } =>
  typeof j === "object" && j !== null && typeof (j as { verification_token?: unknown }).verification_token === "string";

const isEvent = (j: unknown): j is WebhookEventLike => {
  if (typeof j !== "object" || j === null) return false;
  const e = j as { type?: unknown; entity?: { id?: unknown; type?: unknown } };
  return typeof e.type === "string" && typeof e.entity?.id === "string" && typeof e.entity?.type === "string";
};

export async function triggerDeployHook(url: string | undefined): Promise<void> {
  if (!url) throw new Error("VERCEL_DEPLOY_HOOK_URL no configurada");
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) throw new Error(`Deploy Hook respondió ${res.status}`);
}
