import { SectionNav } from "@/ui/section-nav";
import { TopBar } from "@/ui/top-bar";
import { content } from "../content";

// Layout compartido de secciones y artículos: la barra superior vive aquí y no se desmonta al navegar entre ellos, así
// el enlace activo de la navegación entre secciones cambia igual que las pestañas de la portada (sin repintar la barra).
export default async function SectionsLayout({ children }: LayoutProps<"/">) {
  const sections = await content.listSections();
  return (
    <>
      <TopBar right={<SectionNav sections={sections.map(({ slug, title }) => ({ slug, title }))} />} />
      {children}
    </>
  );
}
