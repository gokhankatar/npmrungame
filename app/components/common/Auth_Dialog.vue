<template>
  <v-dialog v-model="isOpen" :max-width="600" scrim="rgba(0, 0, 0, 0.7)" persistent>
    <v-card
      class="auth-dialog-card d-flex flex-column align-center ga-2 ga-lg-4 rounded-lg pa-2 pa-lg-5"
    >
      <v-btn
        @click="isOpen = false"
        icon="mdi-close"
        color="grey-darken-1"
        class="close-btn ma-1"
        variant="text"
        size="small"
        :ripple="false"
      />

      <div class="d-flex justify-center align-center ga-2">
        <v-icon
          :icon="isLoginMode ? 'mdi-login' : 'mdi-account-plus'"
          :size="display.lgAndUp.value ? 'large' : 'default'"
          :color="isLoginMode ? 'green-accent-2' : 'blue-grey-lighten-1'"
        />
        <p
          class="text-center text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-grey-lighten-1 default-title-letter"
        >
          {{ isLoginMode ? "Giriş Yap" : "Kayıt Ol" }}
        </p>
      </div>

      <v-divider class="w-100" color="white" />

      <!-- Tabs -->
      <v-tabs
        v-model="isLoginMode"
        color="green-accent-2"
        class="w-100"
        density="compact"
      >
        <v-tab :value="true" prepend-icon="mdi-login"> Giriş Yap </v-tab>
        <v-tab :value="false" prepend-icon="mdi-account-plus"> Kayıt Ol </v-tab>
      </v-tabs>

      <v-form
        ref="authForm"
        @submit.prevent="handleAuth"
        class="w-100 d-flex flex-column ga-2"
      >
        <v-text-field
          v-if="!isLoginMode"
          v-model="username"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          class="w-100 text-grey-lighten-1"
          color="grey-lighten-1"
          rounded="xl"
          label="Kullanıcı Adı"
          hide-details="auto"
          placeholder="Kullanıcı Adı"
          :density="display.xl.value ? 'comfortable' : 'compact'"
          :rules="rules.username"
          clearable
        />

        <v-text-field
          v-model="email"
          prepend-inner-icon="mdi-email"
          variant="outlined"
          class="w-100 text-grey-lighten-1"
          color="grey-lighten-1"
          rounded="xl"
          hide-details="auto"
          label="Email"
          placeholder="ornek@email.com"
          :density="display.xl.value ? 'comfortable' : 'compact'"
          :rules="rules.email"
          clearable
        />

        <v-text-field
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPassword = !showPassword"
          variant="outlined"
          class="w-100 text-grey-lighten-1"
          color="grey-lighten-1"
          rounded="xl"
          hide-details="auto"
          label="Şifre"
          placeholder="••••••••"
          :density="display.xl.value ? 'comfortable' : 'compact'"
          :rules="rules.password"
          clearable
        />

        <transition name="slide-up">
          <v-alert
            v-if="authMessage"
            :type="authMessageType"
            variant="tonal"
            class="w-100"
            :text="authMessage"
            density="compact"
          />
        </transition>

        <v-btn
          :text="isLoginMode ? 'Giriş Yap' : 'Kayıt Ol'"
          :loading="isLoading"
          class="text-subtitle-2 text-lg-subtitle-1 text-capitalize rounded"
          :prepend-icon="isLoginMode ? 'mdi-login' : 'mdi-account-plus'"
          color="green-accent-2"
          block
          :size="display.lgAndDown.value ? 'small' : 'default'"
          variant="elevated"
          :elevation="0"
          :ripple="false"
          type="submit"
        />
      </v-form>

      <div class="w-100 d-flex align-center ga-2 mt-2">
        <v-divider color="white" />
        <span class="text-caption text-grey-lighten-1">veya</span>
        <v-divider color="white" />
      </div>

      <!-- Social Login Buttons -->
      <v-row class="w-100" dense>
        <v-col cols="12" sm="6">
          <v-btn
            @click="signInWithGoogle"
            :loading="isLoadingGoogle"
            variant="tonal"
            prepend-icon="mdi-google"
            block
            :size="display.lgAndDown.value ? 'small' : 'default'"
            :ripple="false"
            class="text-capitalize rounded"
            text="Google ile Giriş Yap"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-btn
            @click="signInWithSteam"
            :loading="isLoadingSteam"
            variant="tonal"
            prepend-icon="mdi-steam"
            block
            :size="display.lgAndDown.value ? 'small' : 'default'"
            :ripple="false"
            class="text-capitalize rounded"
            text="Steam ile Giriş Yap"
          />
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { VForm } from "vuetify/components";
import store from "~/store/store";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [user: any];
}>();

const { $auth, $firestore } = useNuxtApp();
const display = useDisplay();
const _store = store();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const isLoginMode = ref(true);
const showPassword = ref(false);
const isLoading = ref(false);
const isLoadingGoogle = ref(false);
const isLoadingSteam = ref(false);
const email = ref("");
const password = ref("");
const username = ref("");
const authMessage = ref("");
const authMessageType = ref<"success" | "error" | "info">("info");
const authForm = ref<InstanceType<typeof VForm> | null>(null);

const rules = {
  email: [
    (v: string) => !!v || "Email gerekli",
    (v: string) =>
      (v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) || "Geçerli email adresi giriniz",
  ],
  password: [
    (v: string) => !!v || "Şifre gerekli",
    (v: string) => (v && v.length >= 6) || "Şifre en az 6 karakter olmalı",
  ],
  username: [
    (v: string) => !isLoginMode.value || !!v || "Kullanıcı adı gerekli",
    (v: string) =>
      !isLoginMode.value ||
      (v && v.length >= 3) ||
      "Kullanıcı adı en az 3 karakter olmalı",
  ],
};

const extractNameFromEmail = (email: string) => {
  return email.split("@")[0];
};

const handleAuth = async () => {
  const result = await authForm.value?.validate();
  if (!result?.valid) return;

  try {
    isLoading.value = true;
    authMessage.value = "";

    if (isLoginMode.value) {
      // Giriş Yap
      const userCredential = await signInWithEmailAndPassword(
        $auth,
        email.value,
        password.value
      );
      const user = userCredential.user;

      // Firestore'dan kullanıcı bilgilerini al
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
      authMessage.value = "Giriş başarılı!";
      authMessageType.value = "success";

      setTimeout(() => {
        emit("success", userData);
        isOpen.value = false;
        resetForm();
      }, 1500);
    } else {
      // Kayıt Ol
      const userCredential = await createUserWithEmailAndPassword(
        $auth,
        email.value,
        password.value
      );
      const user = userCredential.user;

      // Firestore'a kullanıcı bilgilerini kaydet
      const finalUsername = username.value || extractNameFromEmail(email.value);

      const userData = {
        uid: user.uid,
        username: finalUsername,
        email: email.value,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const userDocRef = doc($firestore, "registered_users", user.uid);
      await setDoc(userDocRef, userData);

      _store.setUser({ ...userData, emailVerified: user.emailVerified });
      authMessage.value = "Kayıt başarılı!";
      authMessageType.value = "success";

      setTimeout(() => {
        emit("success", { ...userData, emailVerified: user.emailVerified });
        isOpen.value = false;
        resetForm();
      }, 1500);
    }
  } catch (error: any) {
    console.error("Auth error:", error);

    let errorMessage = "Bir hata oluştu";

    if (error.code === "auth/email-already-in-use") {
      errorMessage = "Bu email zaten kullanılıyor";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Şifre çok zayıf";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Geçersiz email adresi";
    } else if (error.code === "auth/user-not-found") {
      errorMessage = "Kullanıcı bulunamadı";
    } else if (error.code === "auth/wrong-password") {
      errorMessage = "Yanlış şifre";
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "Çok fazla deneme. Lütfen daha sonra tekrar deneyin";
    }

    authMessage.value = errorMessage;
    authMessageType.value = "error";
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  email.value = "";
  password.value = "";
  username.value = "";
  authMessage.value = "";
  authForm.value?.reset();
  authForm.value?.resetValidation();
};

const signInWithGoogle = async () => {
  try {
    isLoadingGoogle.value = true;
    authMessage.value = "";

    // $auth kontrolü
    if (!$auth) {
      authMessage.value = "Firebase Auth yüklenemedi. Lütfen sayfayı yenileyin.";
      authMessageType.value = "error";
      isLoadingGoogle.value = false;
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");

    console.log("Google sign in başlatılıyor...");
    const result = await signInWithPopup($auth, provider);
    const user = result.user;
    console.log("Google sign in başarılı:", user);

    // Firestore'dan kullanıcı bilgilerini kontrol et
    const userDocRef = doc($firestore, "registered_users", user.uid);
    const userDoc = await getDoc(userDocRef);

    let userData: any = {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };

    if (!userDoc.exists()) {
      // Yeni kullanıcı - Firestore'a kaydet
      const finalUsername = user.displayName || extractNameFromEmail(user.email || "");
      const newUserData = {
        uid: user.uid,
        username: finalUsername,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userDocRef, newUserData);
      userData = { ...userData, ...newUserData };
    } else {
      // Mevcut kullanıcı - Firestore'dan al
      userData = { ...userData, ...userDoc.data() };
    }

    _store.setUser(userData);
    authMessage.value = "Google ile giriş başarılı!";
    authMessageType.value = "success";

    setTimeout(() => {
      emit("success", userData);
      isOpen.value = false;
      resetForm();
    }, 1500);
  } catch (error: any) {
    console.error("Google sign in error:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);

    let errorMessage = "Google ile giriş başarısız";
    if (error.code === "auth/popup-closed-by-user") {
      errorMessage = "Giriş penceresi kapatıldı";
    } else if (error.code === "auth/popup-blocked") {
      errorMessage = "Popup engellendi. Lütfen tarayıcı ayarlarınızı kontrol edin";
    } else if (error.code === "auth/operation-not-allowed") {
      errorMessage =
        "Google ile giriş etkinleştirilmemiş. Firebase Console'da Google provider'ı etkinleştirin.";
    } else if (error.code === "auth/unauthorized-domain") {
      errorMessage =
        "Bu domain için Google girişi yetkilendirilmemiş. Firebase Console'da authorized domains'e ekleyin.";
    } else {
      errorMessage = `Google ile giriş hatası: ${
        error.message || error.code || "Bilinmeyen hata"
      }`;
    }

    authMessage.value = errorMessage;
    authMessageType.value = "error";
  } finally {
    isLoadingGoogle.value = false;
  }
};

const signInWithSteam = async () => {
  // Önce kullanıcının giriş yapmış olması gerekiyor
  if (!$auth?.currentUser) {
    authMessage.value = "Steam bağlamak için önce giriş yapmanız gerekiyor";
    authMessageType.value = "error";
    return;
  }

  try {
    isLoadingSteam.value = true;

    // Steam OpenID için redirect URL
    const returnUrl = encodeURIComponent(window.location.origin + "/auth/steam/callback");
    const steamAuthUrl = `https://steamcommunity.com/openid/login?openid.mode=checkid_setup&openid.ns=http://specs.openid.net/auth/2.0&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.return_to=${returnUrl}&openid.realm=${window.location.origin}`;

    window.location.href = steamAuthUrl;
  } catch (error: any) {
    console.error("Steam sign in error:", error);
    authMessage.value = "Steam bağlantısı başarısız";
    authMessageType.value = "error";
    isLoadingSteam.value = false;
  }
};

watch(isLoginMode, () => {
  resetForm();
});
</script>

<style scoped>
@import "~/assets/css/main.css";

.auth-dialog-card {
  background: linear-gradient(
    135deg,
    rgba(18, 18, 18, 0.95) 0%,
    rgba(30, 30, 30, 0.95) 100%
  );
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  position: relative;
  overflow: hidden;
}

.auth-dialog-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
      circle at 30% 20%,
      rgba(76, 175, 80, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(circle at 70% 80%, rgba(144, 202, 249, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.auth-dialog-card > * {
  position: relative;
  z-index: 1;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}
</style>
