/**
 * Firebase onAuthStateChanged ilk kez tetiklenene kadar bekler.
 * Middleware / entry gate için.
 */
export function useAuthReady() {
  const ready = useState<boolean>("auth-ready", () => false);
  const uid = useState<string | null>("auth-uid", () => null);

  function markReady(nextUid: string | null) {
    uid.value = nextUid;
    ready.value = true;
  }

  async function waitForAuth(timeoutMs = 8000): Promise<string | null> {
    if (import.meta.server) return null;
    if (ready.value) return uid.value;

    const started = Date.now();
    while (!ready.value && Date.now() - started < timeoutMs) {
      await new Promise((r) => setTimeout(r, 40));
    }
    return uid.value;
  }

  return { ready, uid, markReady, waitForAuth };
}
