import { createNotionGateway } from "@/infrastructure/notion/gateway";
import { handleNotionWebhook, triggerDeployHook } from "@/infrastructure/notion/webhook";

// Webhook de Notion → Deploy Hook de Vercel (ADR-0007). Variables: NOTION_TOKEN, NOTION_WEBHOOK_SECRET, VERCEL_DEPLOY_HOOK_URL.
export async function POST(request: Request) {
  const rawBody = await request.text(); // crudo: la firma se calcula sobre los bytes recibidos
  const result = await handleNotionWebhook(rawBody, request.headers.get("x-notion-signature"), {
    verificationToken: process.env.NOTION_WEBHOOK_SECRET,
    gateway: createNotionGateway(process.env.NOTION_TOKEN ?? ""),
    deploy: () => triggerDeployHook(process.env.VERCEL_DEPLOY_HOOK_URL),
    log: console.log,
  });
  return Response.json(result.body, { status: result.status });
}
