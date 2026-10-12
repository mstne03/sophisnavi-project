import { Experience } from "@/components/experience";
import { Markdown } from "@/ui/markdown";
import { content } from "../content";

// Las entradas animadas del menú llegan del servidor con su estado inicial en `style` (transparentes, desplazadas).
const NO_JS_STYLE =
  "[data-home-intro]{display:none}[data-home-track],[data-home-tabs]{opacity:1!important}[data-home-track] [style]{opacity:1!important;filter:none!important;transform:none!important}";

// Layout compartido de / y /quien-soy: Experience (árbol 3D, intro y pista Inicio ↔ «Quién soy») vive aquí y no se
// desmonta al navegar entre las dos rutas, así el cambio de URL conserva el deslizamiento. Las páginas solo aportan
// sus metadatos y datos estructurados.
export default async function HomeLayout({ children }: LayoutProps<"/">) {
  const [sections, home] = await Promise.all([content.listSections(), content.getHome()]);
  return (
    <>
      <Experience
        sections={sections.map(({ slug, title, description }) => ({ slug, title, description }))}
        // Texto de bienvenida (fila Home · Introducción de Notion): HTML del servidor, lo leen los bots sin JS.
        // Experience solo lo pinta en /quien-soy (o tras abrirlo), sin duplicarlo en /.
        about={
          home && (
            <section aria-labelledby="bienvenida" className="min-h-full px-6 pt-24 pb-24 text-white">
              <div className="mx-auto w-full max-w-3xl">
                <h2 id="bienvenida" className="font-display text-3xl text-cyan-100 sm:text-4xl">
                  Kaltxì!
                </h2>
                <Markdown source={home.body} images={home.images} videos={home.videos} className="prose-sophis mt-6" />
              </div>
            </section>
          )
        }
      />
      {/* Sin JS no hay intro que termine: se quita y la pista (menú o bienvenida, ya en el HTML) se ve tal cual. */}
      <noscript>
        <style>{NO_JS_STYLE}</style>
      </noscript>
      {children}
    </>
  );
}
