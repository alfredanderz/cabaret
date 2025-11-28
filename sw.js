const CACHE_NAME = "cocktail-app-v3";
const APP_SHELL = [
  "./",
  "./index.html",
  "./cup.png",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js",
];

self.addEventListener("install", (event) => {
  console.log("SW: Instalando");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("SW: Activado");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
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
                strDrinkThumb: "./cup.png",
                strCategory: "Offline Mode",
                strAlcoholic: "No disponible",
                strGlass: "Vaso Virtual",
                strInstructions:
                  "No hay internet. Conéctate para ver cocktails reales.",
                strIngredient1: "WiFi",
                strIngredient2: "Datos Móviles",
                strIngredient3: "Paciencia",
                strMeasure1: "1x",
                strMeasure2: "1x",
                strMeasure3: "Mucha",
              },
            ],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      })
    );
  } else {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request);
      })
    );
  }
});
