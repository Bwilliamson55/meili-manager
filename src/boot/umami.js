/**
 * Client-only Umami tracker. No-op when env is missing or the browser is offline.
 * Set VITE_UMAMI_URL (e.g. https://analytics.weeumson.com/stats) and
 * VITE_UMAMI_WEBSITE_ID (from Umami admin for meili-manager.weeumson.com).
 * Hash-mode SPA: pass router so afterEach records client navigations.
 */
import { boot } from "quasar/wrappers";

export default boot(({ router }) => {
  if (typeof window === "undefined") return;

  const src = String(import.meta.env.VITE_UMAMI_URL || "").trim();
  const websiteId = String(import.meta.env.VITE_UMAMI_WEBSITE_ID || "").trim();
  if (!src || !websiteId) return;
  if (navigator.onLine === false) return;

  const alreadyInjected = [...document.querySelectorAll("script[data-website-id]")].some(
    (node) => node.getAttribute("data-website-id") === websiteId,
  );
  if (!alreadyInjected) {
    const script = document.createElement("script");
    script.defer = true;
    script.src = src;
    script.dataset.websiteId = websiteId;
    document.head.appendChild(script);
  }

  if (!router || typeof router.afterEach !== "function") return;

  // Initial pageview is recorded by the script; track SPA/hash navigations after that.
  let isFirstNavigation = true;
  router.afterEach((to) => {
    if (isFirstNavigation) {
      isFirstNavigation = false;
      return;
    }
    if (navigator.onLine === false) return;
    if (typeof window.umami?.track !== "function") return;
    window.umami.track((props) => ({
      ...props,
      url: to.fullPath,
      title: typeof document !== "undefined" ? document.title : props.title,
    }));
  });
});
