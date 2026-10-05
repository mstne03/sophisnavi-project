// ponytail: SW mínimo para instalabilidad; sin caché offline. Añadir Serwist cuando haga falta offline.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
