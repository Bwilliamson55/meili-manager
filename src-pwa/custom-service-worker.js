/* eslint-env serviceworker */

import { clientsClaim } from "workbox-core";
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

self.addEventListener("install", (event) => {
  const p = self.skipWaiting();
  if (
    typeof event.waitUntil === "function" &&
    p &&
    typeof p.then === "function"
  ) {
    event.waitUntil(p);
  }
});

self.addEventListener("activate", (event) => {
  if (typeof event.waitUntil === "function") {
    event.waitUntil(clientsClaim());
  }
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

if (process.env.PROD) {
  registerRoute(
    new NavigationRoute(
      createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML),
      {
        denylist: [
          new RegExp(process.env.PWA_SERVICE_WORKER_REGEX),
          /workbox-(.)*\.js$/,
          /^\/sw\.js$/,
        ],
      },
    ),
  );
}

registerRoute(
  ({ request }) =>
    request.destination === "style" || request.destination === "script",
  new StaleWhileRevalidate({
    cacheName: "meili-manager-assets-v1",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 120,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
);

registerRoute(
  ({ request }) =>
    request.destination === "image" || request.destination === "font",
  new CacheFirst({
    cacheName: "meili-manager-images-v1",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
);
