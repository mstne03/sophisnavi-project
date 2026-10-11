import { AUTHOR_PATH } from "@/application/seo/metadata";

// Rutas de la portada, compartidas entre el servidor (páginas) y el cliente (pestañas).
export const ABOUT_PATH = AUTHOR_PATH;
// Id del panel «Quién soy» y antigua ancla (/#quien-soy): los enlaces viejos se redirigen a ABOUT_PATH.
export const ABOUT_ID = "quien-soy";
