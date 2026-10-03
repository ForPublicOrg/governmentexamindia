/*
 * Service worker for the installed app (and for repeat visits in a browser).
 *
 * Exam dates and statuses change with every daily rebuild, so pages are always
 * fetched from the network first and a cached copy is only shown when there is
 * no connection at all. The footer of every page carries its build date, so a
 * page served from cache says how old it is. Files under /_next/static/ have a
 * content hash in their name and never change, so those are served from cache.
 *
 * Bump VERSION when this file's caching behaviour changes; old caches are
 * dropped on activation.
 */
const VERSION = "v1";
const SHELL = `shell-${VERSION}`;
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;

const OFFLINE_URL = "/offline/";
const MAX_PAGES = 80;
const MAX_ASSETS = 120;

self.addEventListener("install", (event) => {
  event.waitUntil(precacheShell().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  const current = new Set([SHELL, PAGES, ASSETS]);
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => !current.has(name)).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Vercel's analytics endpoints must always reach the network.
  if (url.pathname.startsWith("/_vercel/")) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(event));
  } else if (request.mode === "navigate") {
    event.respondWith(page(event));
  } else {
    event.respondWith(networkFirst(event));
  }
});

/** The offline page and the stylesheets it needs, so it renders styled. */
async function precacheShell() {
  const shell = await caches.open(SHELL);
  const response = await fetch(OFFLINE_URL, { cache: "reload" });
  if (!response.ok) throw new Error(`could not fetch ${OFFLINE_URL}: ${response.status}`);
  const html = await response.clone().text();
  await shell.put(OFFLINE_URL, response);
  const styles = new Set([...html.matchAll(/href="(\/_next\/static\/[^"]+\.css)"/g)].map((match) => match[1]));
  await shell.addAll([...styles]);
}

async function page(event) {
  const { request } = event;
  try {
    const response = await fetch(request);
    if (response.ok) remember(event, PAGES, MAX_PAGES, request, response);
    return response;
  } catch {
    return (
      (await caches.match(request, { ignoreSearch: true })) ??
      (await caches.match(OFFLINE_URL)) ??
      Response.error()
    );
  }
}

async function networkFirst(event) {
  const { request } = event;
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") remember(event, PAGES, MAX_PAGES, request, response);
    return response;
  } catch {
    return (await caches.match(request)) ?? Response.error();
  }
}

async function cacheFirst(event) {
  const { request } = event;
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && response.type === "basic") remember(event, ASSETS, MAX_ASSETS, request, response);
  return response;
}

/**
 * Store a copy of a response without holding up the page, then drop the oldest
 * entries beyond `max` (a re-stored URL moves to the back of the queue).
 */
function remember(event, name, max, request, response) {
  const copy = response.clone();
  event.waitUntil(
    caches.open(name).then(async (cache) => {
      await cache.put(request, copy);
      const keys = await cache.keys();
      await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((key) => cache.delete(key)));
    }),
  );
}
