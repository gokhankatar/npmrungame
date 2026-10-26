import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import store from "~/store/store";
import { isAbortError } from "~/utils/isAbortError";

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return;

  const { markReady } = useAuthReady();
  let started = false;

  const initAuth = () => {
    try {
      const { $auth, $firestore } = useNuxtApp();
      const _store = store();

      if (!$auth) {
        setTimeout(initAuth, 100);
        return;
      }

      // HMR / çift plugin koşusunda listener çoğalmasın
      if (started) return;
      started = true;

      onAuthStateChanged($auth, async (user) => {
        if (user) {
          try {
            if ($firestore) {
              const userDocRef = doc($firestore, "registered_users", user.uid);
              const userDoc = await getDoc(userDocRef);

              let userData: Record<string, unknown> = {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
              };

              if (userDoc.exists()) {
                userData = { ...userData, ...userDoc.data() };
              }

              _store.setUser(userData);
            } else {
              _store.setUser({
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
              });
            }
          } catch (error) {
            // Firestore stream abort (HMR / navigasyon / adblock) — gürültü değil
            if (!isAbortError(error)) {
              console.error("Error fetching user data:", error);
            }
            _store.setUser({
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
            });
          }
          markReady(user.uid);
        } else {
          _store.clearUser();
          markReady(null);
        }
      });
    } catch (error) {
      console.error("Auth plugin error:", error);
      markReady(null);
    }
  };

  initAuth();
});
