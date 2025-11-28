const CACHE_NAME = "cocktail-app-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js",
];

self.addEventListener("install", (event) => {
  console.log("SW: Instalando Service Worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("SW: App Shell cacheado");
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("SW: Service Worker activado");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("SW: Borrando caché antigua", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin === "https://www.thecocktaildb.com") {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            drinks: [
              {
                idDrink: "offline-1",
                strDrink: "Sin Conexión a Internet",
                strDrinkThumb:
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:1'/%3E%3Cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='400' fill='url(%23grad)'/%3E%3Ccircle cx='200' cy='160' r='80' fill='%23fff' opacity='0.2'/%3E%3Crect x='160' y='220' width='80' height='120' rx='10' fill='%23fff' opacity='0.3'/%3E%3Cellipse cx='200' cy='200' rx='60' ry='70' fill='%23fff' opacity='0.15'/%3E%3Ctext x='200' y='370' font-family='Arial' font-size='24' fill='white' text-anchor='middle' font-weight='bold'%3EOFFLINE%3C/text%3E%3C/svg%3E",
                strCategory: "Offline Mode",
                strAlcoholic: "No disponible",
                strGlass: "Vaso Virtual",
                strInstructions:
                  "Parece que no hay conexión a internet en este momento. Por favor, verifica tu conexión WiFi o datos móviles e intenta nuevamente para ver cocktails reales.",
                strIngredient1: "Conexión WiFi",
                strIngredient2: "Datos Móviles",
                strIngredient3: "Paciencia",
                strMeasure1: "1 red activa",
                strMeasure2: "O alternativa",
                strMeasure3: "Al gusto",
              },
            ],
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      })
    );
  } else {
    event.respondWith(
      caches
        .match(request)
        .then((cached) => {
          return cached || fetch(request);
        })
        .catch(() => {
          if (request.mode === "navigate") {
            return caches.match("./index.html");
          }
        })
    );
  }
});
