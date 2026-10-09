// Rutas públicas: portada, las seis secciones y un artículo publicado. El sitemap las enumera todas; aquí se fija una muestra estable.
const routes = ["/", "/pandora", "/personajes", "/clanes", "/saga", "/coleccion", "/vida-fan", "/pandora/la-ciencia-real-detras-de-avatar"];
const gate = ["error", { minScore: 0.85, aggregationMethod: "median" }];

module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm exec next start -H 127.0.0.1 -p 3000",
      startServerReadyPattern: "Ready",
      url: routes.map((r) => `http://127.0.0.1:3000${r}`),
      numberOfRuns: 3, // mediana de 3 ejecuciones; móvil es el valor por defecto de Lighthouse
    },
    assert: {
      assertions: {
        "categories:performance": gate,
        "categories:accessibility": gate,
        "categories:best-practices": gate,
        "categories:seo": gate,
      },
    },
    // Informes en local/artifact, nunca en el almacenamiento público temporal de LHCI.
    upload: { target: "filesystem", outputDir: ".lighthouseci" },
  },
};
