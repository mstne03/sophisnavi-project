import { Client, isFullPage, isNotionClientError } from "@notionhq/client";
import type { PageState } from "@/application/content/publishDecision";
import { mapNotionPage, type NotionPage } from "./mapPage";

// Lo único que el resto del código necesita de Notion. Se sustituye por un fake en los tests del pull.
export interface NotionGateway {
  listPages(dataSourceId: string): Promise<NotionPage[]>;
  getPageMarkdown(pageId: string): Promise<string>;
  getFileUrl(blockId: string): Promise<string | undefined>;
  getBookmarkUrl(blockId: string): Promise<string | undefined>;
  getPageState(pageId: string): Promise<PageState>;
}

// GET /pages/{id}/markdown exige la versión 2026-03-11 de la API.
export const NOTION_VERSION = "2026-03-11";
export const DEFAULT_DATA_SOURCE_ID = "3f111aad-5e58-808b-8698-000b3e72fdae"; // «Web Sophisnavi»

// Subconjunto del SDK que se usa; en los tests se inyecta un fake.
export type NotionSdk = Pick<Client, "dataSources" | "pages" | "blocks">;

export function createNotionGateway(token: string, notion: NotionSdk = new Client({ auth: token, notionVersion: NOTION_VERSION })): NotionGateway {
  return {
    async listPages(dataSourceId) {
      const pages: NotionPage[] = [];
      let cursor: string | undefined;
      do {
        const res = await notion.dataSources.query({
          data_source_id: dataSourceId,
          start_cursor: cursor,
          sorts: [{ timestamp: "created_time", direction: "ascending" }],
        });
        for (const r of res.results) if (isFullPage(r)) pages.push(mapNotionPage(r));
        cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
      } while (cursor);
      return pages;
    },
    async getPageMarkdown(pageId) {
      const res = await notion.pages.retrieveMarkdown({ page_id: pageId });
      if (res.truncated) throw new Error(`Página ${pageId} truncada por Notion (${res.unknown_block_ids.length} bloques sin cargar)`);
      return res.markdown;
    },
    async getFileUrl(blockId) {
      const block = await notion.blocks.retrieve({ block_id: blockId });
      if (!("type" in block)) return undefined;
      const media = block.type === "image" ? block.image : block.type === "file" ? block.file : undefined;
      if (!media) return undefined;
      return media.type === "file" ? media.file.url : media.type === "external" ? media.external.url : undefined;
    },
    // El endpoint de Markdown no convierte los bookmarks: solo da el id del bloque y la URL hay que pedirla aparte.
    async getBookmarkUrl(blockId) {
      const block = await notion.blocks.retrieve({ block_id: blockId });
      return "type" in block && block.type === "bookmark" ? block.bookmark.url : undefined;
    },
    async getPageState(pageId) {
      try {
        const page = await notion.pages.retrieve({ page_id: pageId });
        if (!isFullPage(page)) return null;
        const p = mapNotionPage(page);
        return { inTrash: p.inTrash, status: p.status, statusPropertyId: p.statusPropertyId };
      } catch (e) {
        if (isNotionClientError(e) && e.code === "object_not_found") return null;
        throw e;
      }
    },
  };
}
