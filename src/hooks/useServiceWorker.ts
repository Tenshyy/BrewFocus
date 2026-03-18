import { useEffect } from "react";

/**
 * Enregistre le service worker pour le mode offline / PWA.
 */
export function useServiceWorker() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Silently ignore registration errors
      });
    }
  }, []);
}
