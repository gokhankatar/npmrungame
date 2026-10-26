import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import store from "~/store/store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmailFormat(email: string) {
  return EMAIL_RE.test(email.trim());
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

const firebaseErrorMessage = (code?: string, fallback = "Bir hata oluştu") => {
  switch (code) {
    case "auth/email-already-in-use":
      return "Bu email zaten kullanılıyor";
    case "auth/weak-password":
      return "Şifre çok zayıf";
    case "auth/invalid-email":
      return "Geçersiz email adresi";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email veya şifre hatalı";
    case "auth/too-many-requests":
      return "Çok fazla deneme. Lütfen daha sonra tekrar deneyin";
    case "auth/popup-closed-by-user":
      return "Giriş penceresi kapatıldı";
    case "auth/popup-blocked":
      return "Popup engellendi. Tarayıcı ayarlarını kontrol edin";
    case "auth/operation-not-allowed":
      return "Bu giriş yöntemi etkin değil";
    case "auth/unauthorized-domain":
      return "Bu domain için giriş yetkilendirilmemiş";
    case "auth/expired-action-code":
      return "Bağlantının süresi dolmuş. Yeni bir sıfırlama isteği gönder";
    case "auth/invalid-action-code":
      return "Bağlantı geçersiz veya daha önce kullanılmış";
    case "auth/missing-email":
      return "Email adresi gerekli";
    default:
      return fallback;
  }
};

const extractNameFromEmail = (email: string) => email.split("@")[0] || "oyuncu";

export function useFirebaseAuth() {
  const { $auth, $firestore } = useNuxtApp();
  const _store = store();

  const pending = ref(false);
  const pendingGoogle = ref(false);
  const error = ref("");

  /**
   * Soft pre-check: Firestore `registered_users` email alanı.
   * Kaynak gerçekliği yine Auth `createUser` — bu sadece UX.
   */
  async function isEmailRegistered(email: string): Promise<boolean> {
    const normalized = normalizeEmail(email);
    if (!isValidEmailFormat(normalized) || !$firestore) return false;
    try {
      const snap = await getDocs(
        query(
          collection($firestore, "registered_users"),
          where("email", "==", normalized),
          limit(1)
        )
      );
      if (!snap.empty) return true;

      // Eski kayıtlarda email normalize edilmemiş olabilir
      const raw = email.trim();
      if (raw !== normalized) {
        const snapRaw = await getDocs(
          query(
            collection($firestore, "registered_users"),
            where("email", "==", raw),
            limit(1)
          )
        );
        return !snapRaw.empty;
      }
      return false;
    } catch (e) {
      console.warn("[auth] email check failed", e);
      return false;
    }
  }

  async function login(email: string, password: string) {
    error.value = "";
    pending.value = true;
    try {
      const { user } = await signInWithEmailAndPassword(
        $auth,
        normalizeEmail(email),
        password
      );
      const userDocRef = doc($firestore, "registered_users", user.uid);
      const userDoc = await getDoc(userDocRef);

      let userData: Record<string, any> = {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
      };
      if (userDoc.exists()) userData = { ...userData, ...userDoc.data() };

      _store.setUser(userData);
      return userData;
    } catch (e: any) {
      error.value = firebaseErrorMessage(e?.code);
      throw e;
    } finally {
      pending.value = false;
    }
  }

  async function register(email: string, password: string, username: string) {
    error.value = "";
    pending.value = true;
    try {
      const normalized = normalizeEmail(email);
      const { user } = await createUserWithEmailAndPassword(
        $auth,
        normalized,
        password
      );
      const finalUsername =
        username.trim() || extractNameFromEmail(normalized);

      const userData = {
        uid: user.uid,
        username: finalUsername,
        email: normalized,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc($firestore, "registered_users", user.uid), userData);
      const payload = { ...userData, emailVerified: user.emailVerified };
      _store.setUser(payload);
      return payload;
    } catch (e: any) {
      error.value = firebaseErrorMessage(e?.code);
      throw e;
    } finally {
      pending.value = false;
    }
  }

  async function loginWithGoogle() {
    error.value = "";
    pendingGoogle.value = true;
    try {
      if (!$auth) {
        error.value = "Auth yüklenemedi. Sayfayı yenileyin.";
        throw new Error(error.value);
      }

      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");

      const { user } = await signInWithPopup($auth, provider);
      const userDocRef = doc($firestore, "registered_users", user.uid);
      const userDoc = await getDoc(userDocRef);

      let userData: Record<string, any> = {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };

      if (!userDoc.exists()) {
        const newUserData = {
          uid: user.uid,
          username:
            user.displayName || extractNameFromEmail(user.email || ""),
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userDocRef, newUserData);
        userData = { ...userData, ...newUserData };
      } else {
        userData = { ...userData, ...userDoc.data() };
      }

      _store.setUser(userData);
      return userData;
    } catch (e: any) {
      error.value = firebaseErrorMessage(
        e?.code,
        e?.message || "Google ile giriş başarısız"
      );
      throw e;
    } finally {
      pendingGoogle.value = false;
    }
  }

  /**
   * Firebase email'e şifre sıfırlama linki gönderir.
   * Link varsayılan olarak Firebase action sayfasında açılır;
   * continueUrl ile işlem sonrası login'e döner.
   * (İsteğe bağlı: Console → Auth → Templates → Action URL =
   *  /auth/reset-password ile kendi sayfamızı kullanabilirsin.)
   */
  async function sendPasswordReset(email: string) {
    error.value = "";
    pending.value = true;
    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://www.npmrungame.com";
      await sendPasswordResetEmail($auth, normalizeEmail(email), {
        url: `${origin}/auth/login`,
        handleCodeInApp: false,
      });
    } catch (e: any) {
      // Gizlilik: kayıtlı olmayan email için de aynı UX
      if (
        e?.code === "auth/user-not-found" ||
        e?.code === "auth/invalid-email"
      ) {
        if (e?.code === "auth/invalid-email") {
          error.value = firebaseErrorMessage(e.code);
          throw e;
        }
        return;
      }
      error.value = firebaseErrorMessage(
        e?.code,
        "Sıfırlama maili gönderilemedi"
      );
      throw e;
    } finally {
      pending.value = false;
    }
  }

  async function verifyResetCode(oobCode: string) {
    error.value = "";
    return verifyPasswordResetCode($auth, oobCode);
  }

  async function completePasswordReset(oobCode: string, newPassword: string) {
    error.value = "";
    pending.value = true;
    try {
      await confirmPasswordReset($auth, oobCode, newPassword);
    } catch (e: any) {
      error.value = firebaseErrorMessage(
        e?.code,
        "Şifre güncellenemedi"
      );
      throw e;
    } finally {
      pending.value = false;
    }
  }

  return {
    pending,
    pendingGoogle,
    error,
    login,
    register,
    loginWithGoogle,
    sendPasswordReset,
    verifyResetCode,
    completePasswordReset,
    isEmailRegistered,
  };
}
