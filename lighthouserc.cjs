// ponytail: lista fija de rutas hasta que exista sitemap.xml (paso 0.9); entonces se leen de ahí.
const routes = ["/", "/pandora", "/clanes", "/criaturas", "/lengua-navi", "/peliculas", "/galeria"];
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
