// Decide si un evento de webhook de Notion justifica un despliegue (ADR-0007).
// Pura: el estado de la página lo aporta quien llama, tras consultar la API.

export type WebhookEventLike = {
  type: string;
  entity: { id: string; type: string };
  data?: { updated_properties?: string[] };
};

// null = la página ya no se puede leer (borrada o fuera del alcance de la integración).
export type PageState = { inTrash: boolean; status: string | null; statusPropertyId: string | null } | null;

export const PUBLISHED = "Publicado";

export function shouldDeploy(event: WebhookEventLike, page: PageState): boolean {
  if (event.entity.type !== "page") return false;
  if (page === null || page.inTrash) return true;
  switch (event.type) {
    case "page.deleted":
    case "page.undeleted":
    case "page.moved":
      return true;
    case "page.properties_updated": {
      // Cambió el estado: publica o despublica. Si no, solo importa si ya está publicada.
      const changedStatus = page.statusPropertyId !== null && (event.data?.updated_properties ?? []).includes(page.statusPropertyId);
      return changedStatus || page.status === PUBLISHED;
    }
    case "page.content_updated":
    case "page.created":
      return page.status === PUBLISHED;
    default:
      return false;
  }
}
