import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between py-8">
      <Link href="/" scroll={false} className="font-display text-xl tracking-[0.15em] text-white/90 hover:text-white">
        Sophisnavi
      </Link>
      <span className="text-xs uppercase tracking-[0.4em] text-cyan-200">Eywa ngahu</span>
    </header>
  );
}
