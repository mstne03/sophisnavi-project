"use client";

import { useRouter } from "next/navigation";

// Demo: no envía nada a ningún servidor; solo navega al panel. Nada va en la URL.
export function LoginForm() {
  const router = useRouter();
  const field = "mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300";
  return (
    <form
      className="mt-8 flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        router.push("/admin");
      }}
    >
      <label className="block text-xs uppercase tracking-[0.3em] text-cyan-200">
        Correo
        <input className={field} type="email" autoComplete="username" placeholder="sofi@sophisnavi.com" />
      </label>
      <label className="block text-xs uppercase tracking-[0.3em] text-cyan-200">
        Código de un solo uso
        <input className={`${field} font-mono tracking-[0.4em]`} inputMode="numeric" placeholder="000000" />
      </label>
      <button type="submit" className="mt-2 rounded-lg bg-fuchsia-500/80 px-4 py-2 text-sm font-medium hover:bg-fuchsia-500">
        Entrar
      </button>
    </form>
  );
}
