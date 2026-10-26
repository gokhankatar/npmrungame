/** Firestore/WebChannel veya adblocker kaynaklı iptaller — gürültü, gerçek hata değil */
export function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { name?: string; code?: string | number; message?: string };
  if (e.name === "AbortError") return true;
  if (e.code === 20 || e.code === "aborted") return true;
  const msg = String(e.message || "").toLowerCase();
  return msg.includes("aborted") || msg.includes("signal is aborted");
}
