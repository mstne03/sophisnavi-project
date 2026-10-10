import type { Metadata } from "next";
import { pageMetadata, SITE_NAME } from "@/application/seo/metadata";
import { Experience } from "@/components/experience";
import { Markdown } from "@/ui/markdown";
import { content } from "./content";

export const metadata: Metadata = pageMetadata({
  title: SITE_NAME,
  description: "Todo sobre Avatar en español: Pandora, personajes, clanes, la saga, colección y vida fan, por Sofi (@sophisnavi).",
  path: "/",
});

export default async function Home() {
  const [sections, home] = await Promise.all([content.listSections(), content.getHome()]);
  return (
    <Experience
      sections={sections.map(({ slug, title, description }) => ({ slug, title, description }))}
      // Texto de bienvenida (fila Home · Introducción de Notion): HTML del servidor, lo leen los bots sin JS.
      // Experience lo muestra como vista «Quién soy» (#quien-soy), solo accesible desde las pestañas.
      about={
        home && (
          <section aria-labelledby="bienvenida" className="min-h-full px-6 pt-24 pb-24 text-white">
            <div className="mx-auto w-full max-w-3xl">
              <h2 id="bienvenida" className="font-display text-3xl text-cyan-100 sm:text-4xl">
                Kaltxì!
              </h2>
              <Markdown source={home.body} images={home.images} className="prose-sophis mt-6" />
            </div>
          </section>
        )
      }
    />
  );
}
