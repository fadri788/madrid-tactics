// Madrid Tactics Tracker – service worker
// Network first: when the site is reachable you always get the newest data.js,
// otherwise the app falls back to the last cached copy (works offline).
const CACHE = "madrid-tactics-v3";

const CORE = [
  "./",
  "./index.html",
  "./match.html",
  "./tactics.html",
  "./manifest.webmanifest",
  "./css/theme.css",
  "./css/dashboard.css",
  "./css/tactics.css",
  "./css/match.css",
  "./js/vendor/html-to-image.js",
  "./fonts/suse-latin-wght-normal.woff2",
  "./fonts/suse-latin-ext-wght-normal.woff2",
  "./fonts/jetbrains-mono-latin-wght-normal.woff2",
  "./assets/system.css",
  "./assets/system.js",
  "./assets/motion/motion.css",
  "./assets/motion/motion.js",
  "./assets/layout/layout.css",
  "./assets/layout/layout.js",
  "./assets/ui/ui.js",
  "./assets/moments/moments.js",
  "./assets/moments/lib.js",
  "./assets/moments/iris-opens/moment.css",
  "./assets/moments/iris-opens/moment.js",
  "./js/data.js",
  "./js/stadiums.js",
  "./js/boards.js",
  "./js/dashboard.js",
  "./js/match.js",
  "./js/tactics.js",
  "./js/pwa.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/favicon.svg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  e.respondWith(
    fetch(req)
      .then((res) => {
        // Cache everything fetched, so it works offline too.
        if (res.ok || res.type === "opaque") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: req.mode === "navigate" })
          .then((hit) => hit || (req.mode === "navigate" ? caches.match("./index.html") : undefined))
      )
  );
});
