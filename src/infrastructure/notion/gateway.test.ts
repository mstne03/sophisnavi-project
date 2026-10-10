// @vitest-environment node
import { APIErrorCode, APIResponseError } from "@notionhq/client";
import { describe, expect, it, vi } from "vitest";
import { createNotionGateway, type NotionSdk } from "./gateway";

const fullPage = (id: string, status = "Publicado") => ({
  object: "page",
  id,
  url: `https://www.notion.so/${id}`,
  created_time: "2026-10-08T00:00:00.000Z",
  last_edited_time: "2026-10-09T00:00:00.000Z",
  in_trash: false,
  properties: {
    Vlog: { id: "title", type: "title", title: [{ plain_text: "T " + id }] },
    Estado: { id: "O2dmOw", type: "status", status: { name: status } },
    Tipo: { id: "t", type: "select", select: { name: "Artículo" } },
    Sección: { id: "s", type: "select", select: { name: "Pandora" } },
  },
});

const notFound = () => new APIResponseError({ code: APIErrorCode.ObjectNotFound, message: "no", status: 404, headers: new Headers(), rawBodyText: "", additional_data: undefined, request_id: undefined });

function sdk(over: Partial<{ query: unknown; retrieveMarkdown: unknown; retrieve: unknown; block: unknown }> = {}): NotionSdk {
  const query = vi.fn().mockResolvedValueOnce({ results: [fullPage("a"), { object: "page", id: "parcial" }], has_more: true, next_cursor: "c2" }).mockResolvedValueOnce({ results: [fullPage("b")], has_more: false, next_cursor: null });
  return {
    dataSources: { query: over.query ?? query },
    pages: {
      retrieveMarkdown: over.retrieveMarkdown ?? vi.fn().mockResolvedValue({ markdown: "# md", truncated: false, unknown_block_ids: [] }),
      retrieve: over.retrieve ?? vi.fn().mockResolvedValue(fullPage("a")),
    },
    blocks: { retrieve: over.block ?? vi.fn().mockResolvedValue({ type: "image", image: { type: "file", file: { url: "https://s3/x" } } }) },
  } as unknown as NotionSdk;
}

// Protege: el adaptador del SDK pagina, ignora respuestas parciales, exige la versión con Markdown y traduce 404 a "página no disponible".
describe("createNotionGateway", () => {
  it("lista todas las páginas completas siguiendo la paginación", async () => {
    const s = sdk();
    const pages = await createNotionGateway("tok", s).listPages("ds");
    expect(pages.map((p) => p.id)).toEqual(["a", "b"]);
    expect(s.dataSources.query).toHaveBeenCalledTimes(2);
    expect(s.dataSources.query).toHaveBeenLastCalledWith(expect.objectContaining({ data_source_id: "ds", start_cursor: "c2" }));
  });

  it("devuelve el Markdown y falla si Notion lo truncó", async () => {
    expect(await createNotionGateway("tok", sdk()).getPageMarkdown("a")).toBe("# md");
    const truncated = sdk({ retrieveMarkdown: vi.fn().mockResolvedValue({ markdown: "", truncated: true, unknown_block_ids: ["x", "y"] }) });
    await expect(createNotionGateway("tok", truncated).getPageMarkdown("a")).rejects.toThrow(/truncada.*2 bloques/);
  });

  it("resuelve la URL de un bloque de imagen o archivo, interno o externo, y undefined en el resto", async () => {
    expect(await createNotionGateway("tok", sdk()).getFileUrl("b1")).toBe("https://s3/x");
    const ext = sdk({ block: vi.fn().mockResolvedValue({ type: "file", file: { type: "external", external: { url: "https://ext/y" } } }) });
    expect(await createNotionGateway("tok", ext).getFileUrl("b2")).toBe("https://ext/y");
    const para = sdk({ block: vi.fn().mockResolvedValue({ type: "paragraph", paragraph: {} }) });
    expect(await createNotionGateway("tok", para).getFileUrl("b3")).toBeUndefined();
    const partial = sdk({ block: vi.fn().mockResolvedValue({ object: "block", id: "b4" }) });
    expect(await createNotionGateway("tok", partial).getFileUrl("b4")).toBeUndefined();
    const upload = sdk({ block: vi.fn().mockResolvedValue({ type: "image", image: { type: "file_upload", file_upload: { id: "u" } } }) });
    expect(await createNotionGateway("tok", upload).getFileUrl("b5")).toBeUndefined();
  });

  it("resuelve la URL de un bookmark y undefined en cualquier otro bloque", async () => {
    const bookmark = sdk({ block: vi.fn().mockResolvedValue({ type: "bookmark", bookmark: { url: "https://www.tiktok.com/@a/video/1", caption: [] } }) });
    expect(await createNotionGateway("tok", bookmark).getBookmarkUrl("b1")).toBe("https://www.tiktok.com/@a/video/1");
    expect(await createNotionGateway("tok", sdk()).getBookmarkUrl("b2")).toBeUndefined();
    const partial = sdk({ block: vi.fn().mockResolvedValue({ object: "block", id: "b3" }) });
    expect(await createNotionGateway("tok", partial).getBookmarkUrl("b3")).toBeUndefined();
  });

  it("devuelve el estado de la página, null si es parcial o no existe, y propaga otros errores", async () => {
    expect(await createNotionGateway("tok", sdk()).getPageState("a")).toEqual({ inTrash: false, status: "Publicado", statusPropertyId: "O2dmOw" });
    expect(await createNotionGateway("tok", sdk({ retrieve: vi.fn().mockResolvedValue({ object: "page", id: "p" }) })).getPageState("p")).toBeNull();
    expect(await createNotionGateway("tok", sdk({ retrieve: vi.fn().mockRejectedValue(notFound()) })).getPageState("gone")).toBeNull();
    await expect(createNotionGateway("tok", sdk({ retrieve: vi.fn().mockRejectedValue(new Error("red")) })).getPageState("x")).rejects.toThrow("red");
  });

  it("construye un cliente real por defecto sin romper", () => {
    expect(createNotionGateway("tok")).toHaveProperty("listPages");
  });
});
