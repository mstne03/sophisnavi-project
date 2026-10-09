import type { PageObjectResponse } from "@notionhq/client";
import { HOME_NOTION_NAME, sectionForNotionName, slugify, type SectionSlug } from "@/domain/content";

// Fila de «Web Sophisnavi» ya interpretada. Pura: solo lee propiedades de la respuesta de la API.
export type NotionPage = {
  id: string;
  title: string;
  status: string | null;
  statusPropertyId: string | null;
  kind: "article" | "intro" | null;
  section: SectionSlug | "home" | null;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  inTrash: boolean;
};

type Props = PageObjectResponse["properties"];
const text = (p: Props[string] | undefined): string =>
  p?.type === "title" ? p.title.map((t) => t.plain_text).join("") : p?.type === "rich_text" ? p.rich_text.map((t) => t.plain_text).join("") : "";
const option = (p: Props[string] | undefined): string | null =>
  p?.type === "select" ? (p.select?.name ?? null) : p?.type === "status" ? (p.status?.name ?? null) : null;

export function mapNotionPage(page: PageObjectResponse): NotionPage {
  const p = page.properties;
  const title = text(p.Vlog).trim();
  const sectionName = option(p["Sección"]);
  const tipo = option(p.Tipo);
  const slug = slugify(text(p.Slug).trim() || title);
  return {
    id: page.id,
    title,
    status: option(p.Estado),
    statusPropertyId: p.Estado?.id ?? null,
    kind: tipo === "Artículo" ? "article" : tipo === "Introducción" ? "intro" : null,
    section: sectionName === HOME_NOTION_NAME ? "home" : (sectionForNotionName(sectionName)?.slug ?? null),
    slug,
    description: text(p["Descripción"]).trim(),
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
    inTrash: page.in_trash,
  };
}
