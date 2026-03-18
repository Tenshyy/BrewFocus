/**
 * Utilitaire pour les notifications systeme (Browser Notification API).
 * Gere la permission et envoie des notifications meme quand l'onglet est en arriere-plan.
 */

/**
 * Envoie une notification systeme si la permission est accordee.
 * Silencieux si le navigateur ne supporte pas l'API ou si la permission est refusee.
 */
export function sendNotification(
  title: string,
  body: string,
  tag?: string
): void {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag: tag || "brewfocus",
    });
  } catch {
    // Silently ignore errors (e.g., mobile browsers)
  }
}

/**
 * Demande la permission pour les notifications.
 * Retourne true si la permission est accordee.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;

  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}

/**
 * Verifie si les notifications sont supportees par le navigateur.
 */
export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}
