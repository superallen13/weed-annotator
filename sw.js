// Keeps the app's own files on the phone so that it opens with no network, as on a farm.
// With a network the newest version is fetched and kept; without one, the kept copy is used.
const CACHE = "weed-annotator";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(
    // Past the browser's own short-lived copy, so a new version arrives the first time it is opened online.
    fetch(event.request.url, { cache: "no-cache" })
      .then(response => {
        if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); }
        return response;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }).then(kept => kept ?? caches.match("./index.html")))
  );
});
