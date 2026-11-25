const V = "gaserauto-v1";
const ASSETS = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  if (r.mode === "navigate") {
    // сторінка: спершу мережа (завжди свіжа версія), без інтернету — збережена копія
    e.respondWith(
      fetch(r).then(res => {
        const copy = res.clone();
        caches.open(V).then(c => c.put("index.html", copy));
        return res;
      }).catch(() => caches.match("index.html"))
    );
    return;
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r)));
});
