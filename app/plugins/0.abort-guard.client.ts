import { isAbortError } from "~/utils/isAbortError";

/**
 * Firestore WebChannel getDoc sonrası stream abort'u bazen unhandledrejection
 * olarak düşer. Auth/plugin init'ten önce yakala.
 */
export default defineNuxtPlugin({
  name: "abort-guard",
  enforce: "pre",
  setup() {
    if (!import.meta.client) return;

    const silence = (event: PromiseRejectionEvent) => {
      if (isAbortError(event.reason)) {
        event.preventDefault();
        event.stopImmediatePropagation?.();
      }
    };

    window.addEventListener("unhandledrejection", silence, true);

    // Chrome bazen AbortError'ı window error olarak da basar
    window.addEventListener(
      "error",
      (event) => {
        if (isAbortError(event.error)) {
          event.preventDefault();
        }
      },
      true
    );
  },
});
