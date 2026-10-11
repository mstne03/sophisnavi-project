// Cabecera de secciones y artículos. La marca (árbol + nombre) ya no va aquí: es fija en toda la web (BrandMark, en el
// layout raíz). Queda el lema a la derecha, en la misma fila que ocupa la marca.
export function SiteHeader() {
  return (
    <header className="flex items-center justify-end py-8">
      <span className="text-xs uppercase tracking-[0.4em] text-cyan-200">Eywa ngahu</span>
    </header>
  );
}
