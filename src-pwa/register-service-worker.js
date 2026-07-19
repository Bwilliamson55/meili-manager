import { register } from "register-service-worker";
import { Loading, Notify } from "quasar";

function showUpdateLoading() {
  try {
    Loading.show({ message: "Applying update…", delay: 0 });
  } catch {
    /* Quasar may not be ready */
  }
}

function applyWaitingServiceWorkerUpdate(registration) {
  showUpdateLoading();
  const waiting = registration?.waiting;
  if (!waiting) {
    window.location.reload();
    return;
  }
  let reloaded = false;
  const finish = () => {
    if (reloaded) return;
    reloaded = true;
    clearTimeout(fallbackTimer);
    navigator.serviceWorker.removeEventListener(
      "controllerchange",
      onControllerChange,
    );
    window.location.reload();
  };
  const onControllerChange = () => finish();
  const fallbackTimer = setTimeout(() => finish(), 12000);
  navigator.serviceWorker.addEventListener(
    "controllerchange",
    onControllerChange,
  );
  waiting.postMessage({ type: "SKIP_WAITING" });
}

function notifyUpdateAvailable(registration) {
  Notify.create({
    group: "pwa-update",
    message: "A new version of Meili Manager is ready.",
    caption: "Reload to finish updating.",
    color: "dark",
    textColor: "primary",
    icon: "system_update",
    timeout: 0,
    actions: [
      {
        label: "Reload",
        color: "primary",
        handler: () => {
          void navigator.serviceWorker.getRegistration().then((reg) => {
            applyWaitingServiceWorkerUpdate(reg || registration);
          });
        },
      },
      { label: "Later", color: "grey" },
    ],
  });
}

register(process.env.SERVICE_WORKER_FILE, {
  registrationOptions: { updateViaCache: "none" },
  ready() {
    console.log("[PWA] Service worker is active.");
  },
  registered(registration) {
    if (registration?.waiting) notifyUpdateAvailable(registration);
  },
  updated(registration) {
    notifyUpdateAvailable(registration);
  },
  offline() {
    console.log("[PWA] Running in offline mode (UI shell only).");
  },
  error(err) {
    console.error("[PWA] Service worker error:", err);
  },
});
