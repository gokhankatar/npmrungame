import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import store from "~/store/store";

export default defineNuxtPlugin(() => {
  if (process.client) {
    // Firebase plugin'inin yüklenmesini bekle
    const initAuth = () => {
      try {
        const { $auth, $firestore } = useNuxtApp();
        const _store = store();

        // $auth'un tanımlı olduğundan emin ol
        if (!$auth) {
          // Eğer auth henüz hazır değilse, biraz bekle ve tekrar dene
          setTimeout(initAuth, 100);
          return;
        }

        onAuthStateChanged($auth, async (user) => {
          if (user) {
            try {
              // Firestore'dan kullanıcı bilgilerini al
              if ($firestore) {
                const userDocRef = doc($firestore, "registered_users", user.uid);
                const userDoc = await getDoc(userDocRef);

                let userData: any = {
                  uid: user.uid,
                  email: user.email,
                  emailVerified: user.emailVerified,
                };

                if (userDoc.exists()) {
                  userData = { ...userData, ...userDoc.data() };
                }

                _store.setUser(userData);
              } else {
                // Firestore yoksa sadece auth bilgilerini kaydet
                _store.setUser({
                  uid: user.uid,
                  email: user.email,
                  emailVerified: user.emailVerified,
                });
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
          } else {
            _store.clearUser();
          }
        });
      } catch (error) {
        console.error("Auth plugin error:", error);
      }
    };

    // İlk denemeyi başlat
    initAuth();
  }
});
