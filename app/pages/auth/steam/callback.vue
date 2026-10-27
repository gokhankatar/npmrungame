<template>
  <div class="steam-cb">
    <div class="steam-cb__card">
      <template v-if="isProcessing">
        <v-progress-circular indeterminate color="#69f0ae" size="48" width="3" />
        <p class="steam-cb__text">Steam bağlanıyor…</p>
      </template>

      <template v-else-if="error">
        <v-icon icon="mdi-alert-circle" size="48" color="error" />
        <p class="steam-cb__text">{{ error }}</p>
        <div class="steam-cb__actions">
          <NuxtLink to="/dashboard/account" class="steam-cb__btn steam-cb__btn--primary">
            Hesaba dön
          </NuxtLink>
          <NuxtLink to="/auth/login" class="steam-cb__btn">
            Giriş yap
          </NuxtLink>
        </div>
      </template>

      <template v-else>
        <v-icon icon="mdi-check-circle" size="48" color="#69f0ae" />
        <p class="steam-cb__text">Steam hesabın bağlandı</p>
        <p class="steam-cb__sub">Hesap sayfasına yönlendiriliyorsun…</p>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import store from "~/store/store";
import { extractSteamIdFromClaimedId } from "~/utils/steamOpenId";

definePageMeta({
  layout: "auth",
  ssr: false,
});

const route = useRoute();
const router = useRouter();
const { $firestore, $auth } = useNuxtApp();
const _store = store();

const isProcessing = ref(true);
const error = ref("");

function waitForAuthUser(timeoutMs = 8000): Promise<import("firebase/auth").User | null> {
  return new Promise((resolve) => {
    if ($auth?.currentUser) {
      resolve($auth.currentUser);
      return;
    }
    if (!$auth) {
      resolve(null);
      return;
    }
    const timer = setTimeout(() => {
      unsub();
      resolve($auth.currentUser);
    }, timeoutMs);
    const unsub = onAuthStateChanged($auth, (user) => {
      clearTimeout(timer);
      unsub();
      resolve(user);
    });
  });
}

async function saveSteamIdToUser(steamId: string, uid: string) {
  if (!$firestore) throw new Error("Firestore yok");

  const userDocRef = doc($firestore, "registered_users", uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    await updateDoc(userDocRef, {
      steamId,
      updatedAt: serverTimestamp(),
    });
    _store.setUser({ ..._store.user, ...userDoc.data(), steamId, uid });
  } else {
    const authUser = $auth?.currentUser;
    const userData = {
      uid,
      username:
        authUser?.displayName ||
        authUser?.email?.split("@")[0] ||
        "Oyuncu",
      email: authUser?.email || "",
      steamId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(userDocRef, userData);
    _store.setUser({ ..._store.user, ...userData });
  }
}

onMounted(async () => {
  try {
    const claimedId = route.query["openid.claimed_id"] as string | undefined;
    const mode = route.query["openid.mode"] as string | undefined;

    if (!claimedId || mode !== "id_res") {
      error.value = "Geçersiz Steam yanıtı. Tekrar dene.";
      isProcessing.value = false;
      return;
    }

    const steamId = extractSteamIdFromClaimedId(claimedId);
    if (!steamId) {
      error.value = "Steam ID bulunamadı.";
      isProcessing.value = false;
      return;
    }

    const authUser = await waitForAuthUser();
    if (!authUser) {
      error.value =
        "Steam bağlamak için önce panele giriş yapman gerekiyor.";
      isProcessing.value = false;
      const redirect = encodeURIComponent("/dashboard/account");
      setTimeout(() => {
        router.replace(`/auth/login?redirect=${redirect}`);
      }, 2200);
      return;
    }

    await saveSteamIdToUser(steamId, authUser.uid);
    isProcessing.value = false;

    setTimeout(() => {
      router.replace("/dashboard/account");
    }, 1200);
  } catch (err: any) {
    console.error("Steam callback hatası:", err);
    error.value = err?.message || "Steam bağlanırken bir hata oluştu.";
    isProcessing.value = false;
  }
});
</script>

<style scoped>
.steam-cb {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: min(70vh, 28rem);
  padding: 1rem;
}

.steam-cb__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
  max-width: 26rem;
  padding: 2rem 1.5rem;
  border-radius: 1.15rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  background: rgb(12 18 32 / 0.92);
  text-align: center;
}

.steam-cb__text {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #e8eef7;
}

.steam-cb__sub {
  margin: 0;
  font-size: 0.85rem;
  color: #94a3b8;
}

.steam-cb__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.35rem;
}

.steam-cb__btn {
  display: inline-flex;
  align-items: center;
  min-height: 2.35rem;
  padding: 0.45rem 0.95rem;
  border-radius: 999px;
  border: 1px solid rgb(255 255 255 / 0.14);
  color: #cbd5e1;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
}

.steam-cb__btn--primary {
  border-color: transparent;
  background: #69f0ae;
  color: #07140f;
}
</style>
