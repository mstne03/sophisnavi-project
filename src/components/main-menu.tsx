"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { SECTIONS } from "@/lib/sections";

const list: Variants = {
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

export function MainMenu({ animateIn = true }: { animateIn?: boolean }) {
  return (
    <motion.div
      className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 py-10 [text-shadow:0_1px_14px_rgba(2,4,10,0.9)] sm:px-10 sm:py-14"
      initial={animateIn ? "hidden" : false}
      animate="show"
      variants={list}
    >
      <motion.header variants={item}>
        <p className="text-xs font-medium uppercase tracking-[0.4em] text-cyan-200">Eywa ngahu</p>
        <h1 className="mt-3 font-display text-5xl text-white sm:text-7xl">Sophisnavi</h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-white/85">
          Tu puerta a Pandora: su mundo, sus pueblos y su lengua.
        </p>
      </motion.header>

      <nav aria-label="Menú principal" className="mt-16 sm:mt-auto sm:pt-16">
        <ul className="grid gap-x-12 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s, i) => (
            <motion.li key={s.slug} variants={item}>
              <Link
                href={`/${s.slug}`}
                className="group block rounded-xl py-4 outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-8 focus-visible:ring-offset-transparent"
              >
                <span className="font-mono text-xs text-cyan-200">{String(i + 1).padStart(2, "0")}</span>
                <span className="mt-1 flex items-baseline justify-between gap-4">
                  <span className="font-display text-3xl text-white transition-[text-shadow] duration-500 group-hover:[text-shadow:0_0_24px_rgba(232,121,249,0.9)] group-focus-visible:[text-shadow:0_0_24px_rgba(232,121,249,0.9)]">
                    {s.title}
                  </span>
                  <span aria-hidden className="text-fuchsia-200 transition-transform duration-300 group-hover:translate-x-1.5">
                    →
                  </span>
                </span>
                <span
                  aria-hidden
                  className="mt-3 block h-px origin-left scale-x-[0.15] bg-linear-to-r from-cyan-300 to-fuchsia-400 transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
                />
                <span className="mt-3 block text-sm leading-relaxed text-white/85">{s.description}</span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>

      <motion.p variants={item} className="mt-12 text-xs text-white/60">
        Proyecto fan no oficial. Avatar es una marca de sus respectivos propietarios.
      </motion.p>
    </motion.div>
  );
}
