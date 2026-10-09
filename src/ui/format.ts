const fmt = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" });

export const formatDate = (iso: string) => fmt.format(new Date(iso));
