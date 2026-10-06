// Cross-Origin Isolation Service Worker (COOP + COEP: credentialless)
// Enables SharedArrayBuffer multi-threaded WebAssembly SIMD on static hosts (GitHub Pages, HF Spaces).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.cache === "only-if-cached" && req.mode !== "same-origin") return;
  if (req.mode !== "navigate") return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (!res || res.status === 0 || res.type === "opaque") return res;
        const headers = new Headers(res.headers);
        headers.set("Cross-Origin-Opener-Policy", "same-origin");
        headers.set("Cross-Origin-Embedder-Policy", "credentialless");
        return new Response(res.body, {
          status: res.status,
          statusText: res.statusText,
          headers,
        });
      })
      .catch(() => fetch(req))
  );
});
