import type { Metadata } from "next";
import { AUTHOR, breadcrumbJsonLd, pageMetadata, profilePageJsonLd } from "@/application/seo/metadata";
import { ABOUT_PATH } from "@/components/home-anchors";
import { JsonLd } from "@/ui/json-ld";
import { content } from "../../content";

const TITLE = "Quién soy";

export async function generateMetadata(): Promise<Metadata> {
  const home = await content.getHome();
  return pageMetadata({ title: TITLE, description: `Soy Sofi (@${AUTHOR.handle}): ${AUTHOR.description}`, path: ABOUT_PATH, updatedAt: home?.updatedAt });
}

// La bienvenida la pinta el layout del grupo (home), en el panel «Quién soy» ya abierto; aquí van los datos
// estructurados de la página de autora (E-E-A-T): ProfilePage con la Person y la miga de pan.
export default async function AboutPage() {
  const home = await content.getHome();
  return (
    <>
      <JsonLd data={profilePageJsonLd({ name: TITLE, updatedAt: home?.updatedAt })} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: TITLE, path: ABOUT_PATH }])} />
    </>
  );
}
