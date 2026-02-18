<template>
  <v-container class="d-flex align-center justify-center" style="min-height: 100vh">
    <v-card class="pa-8 rounded-lg text-center" max-width="500">
      <v-progress-circular v-if="isProcessing" indeterminate color="green-accent-2" size="64" />
      <div v-else-if="error" class="d-flex flex-column align-center ga-3">
        <v-icon icon="mdi-alert-circle" size="64" color="error" />
        <p class="text-subtitle-1 text-grey-lighten-1">{{ error }}</p>
        <v-btn @click="goHome" color="green-accent-2" variant="tonal" prepend-icon="mdi-home">
          Ana Sayfaya Dön
        </v-btn>
      </div>
      <div v-else class="d-flex flex-column align-center ga-3">
        <v-icon icon="mdi-check-circle" size="64" color="success" />
        <p class="text-subtitle-1 text-grey-lighten-1">Steam hesabınız bağlandı!</p>
        <v-progress-circular indeterminate color="green-accent-2" size="24" />
      </div>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import store from "~/store/store";

definePageMeta({
  layout: "default",
});

const route = useRoute();
const router = useRouter();
const { $firestore, $auth } = useNuxtApp();
const _store = store();

const isProcessing = ref(true);
const error = ref("");

const extractSteamId = (claimedId: string): string | null => {
  // Steam OpenID'den gelen URL: https://steamcommunity.com/openid/id/76561199046649191
  const match = claimedId.match(/\/id\/(\d+)$/);
  return match ? match[1] : null;
};

const saveSteamIdToUser = async (steamId: string) => {
  if (!$auth?.currentUser) {
    error.value = "Giriş yapmanız gerekiyor";
    return;
  }

  try {
    const user = $auth.currentUser;
    const userDocRef = doc($firestore, "registered_users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // Mevcut kullanıcı - Steam ID'yi güncelle
      await updateDoc(userDocRef, {
        steamId: steamId,
        updatedAt: serverTimestamp(),
      });

      // Store'u güncelle
      const userData = { ...userDoc.data(), steamId };
      _store.setUser({ ..._store.user, steamId });
    } else {
      // Yeni kullanıcı - Steam ID ile kayıt oluştur
      const userData = {
        uid: user.uid,
        username: user.displayName || user.email?.split("@")[0] || "Kullanıcı",
        email: user.email,
        steamId: steamId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userDocRef, userData);
      _store.setUser({ ..._store.user, ...userData });
    }

    // Başarılı - profil sayfasına yönlendir
    setTimeout(() => {
      router.push(`/profile/${user.uid}`);
    }, 2000);
  } catch (err: any) {
    console.error("Steam ID kaydetme hatası:", err);
    error.value = "Steam ID kaydedilirken hata oluştu";
  } finally {
    isProcessing.value = false;
  }
};

const goHome = () => {
  router.push("/");
};

onMounted(async () => {
  try {
    // Steam OpenID'den gelen parametreleri kontrol et
    const claimedId = route.query["openid.claimed_id"] as string;
    const mode = route.query["openid.mode"] as string;

    if (!claimedId || mode !== "id_res") {
      error.value = "Geçersiz Steam giriş yanıtı";
      isProcessing.value = false;
      return;
    }

    // Steam ID'yi çıkar
    const steamId = extractSteamId(claimedId);

    if (!steamId) {
      error.value = "Steam ID bulunamadı";
      isProcessing.value = false;
      return;
    }

    // Kullanıcı giriş yapmış mı kontrol et
    // Firebase auth state'i beklemek için biraz zaman ver
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    if (!$auth?.currentUser) {
      // Giriş yapılmamış - önce giriş yapması gerekiyor
      error.value = "Steam ID'yi kaydetmek için önce giriş yapmanız gerekiyor";
      isProcessing.value = false;
      
      setTimeout(() => {
        router.push("/");
      }, 3000);
      return;
    }

    // Steam ID'yi kullanıcıya kaydet
    await saveSteamIdToUser(steamId);
  } catch (err: any) {
    console.error("Steam callback hatası:", err);
    error.value = "Bir hata oluştu: " + (err.message || "Bilinmeyen hata");
    isProcessing.value = false;
  }
});
</script>

<style scoped>
@import "~/assets/css/main.css";
</style>
