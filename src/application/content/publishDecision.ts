// Decide si un evento de webhook de Notion justifica un despliegue (ADR-0007).
// Pura: el estado de la página lo aporta quien llama, tras consultar la API.
// Solo publicar, despublicar, borrar, restaurar o mover dispara un build. Editar una página ya publicada (texto u otras
// propiedades) no: Notion manda eventos sin parar mientras se escribe y cada build es un despliegue más guardado en Vercel.
// Esas ediciones las publica la sincronización diaria (stalePages).

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
    case "page.properties_updated":
      // Solo cuenta el cambio de Estado: publica o despublica. Sin el id de la propiedad no se puede saber, y se despliega
      // si la página está publicada por si acaba de publicarse.
      if (page.statusPropertyId === null) return page.status === PUBLISHED;
      return (event.data?.updated_properties ?? []).includes(page.statusPropertyId);
    case "page.created":
      // Una página que nace publicada (p. ej. al duplicar una publicada). Es un único evento, no una ráfaga.
      return page.status === PUBLISHED;
    default:
      return false;
  }
}

// Red de seguridad del webhook: un evento se puede perder (Deploy Hook saturado, suscripción pausada por Notion, caída).
// Una página está desfasada si se editó después del build desplegado y afecta a lo publicado: está publicada ahora, o
// estaba en el snapshot (se despublicó, borró o movió). Los borradores que nunca se publicaron no cuentan.
export type PageSummary = { id: string; status: string | null; inTrash: boolean; updatedAt: string };

export function stalePages(pages: PageSummary[], builtAt: string, builtIds: ReadonlySet<string>): PageSummary[] {
  return pages.filter((p) => p.updatedAt > builtAt && (p.status === PUBLISHED || builtIds.has(p.id)));
}
