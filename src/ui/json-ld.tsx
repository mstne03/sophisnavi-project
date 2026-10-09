// Datos estructurados. "<" se escapa para que un texto del contenido no pueda cerrar el <script>.
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
