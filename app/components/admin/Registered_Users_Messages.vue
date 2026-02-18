<template>
  <v-row class="d-flex justify-center align-center mx-auto mt-5 mt-lg-10">
    <!-- Registered Users -->
    <v-col cols="12" lg="10" class="d-flex justify-space-between align-center">
      <div class="d-flex align-center justify-center justify-sm-start ga-2 ga-lg-5 mt-2 mt-lg-5">
        <Animated_Text :text="`Kayıtlı Kullanıcılar (${registeredUsers?.length})`" class="cursor-pointer"
          :msPerChar="50" :duration="550" :loop="true" />
      </div>

      <v-btn icon="mdi-refresh" class="rounded text-caption text-lg-subtitle-2" :ripple="false" variant="text"
        rounded="xl" :color="isGettingRegisteredUsers ? 'green-accent-2' : 'grey-lighten-1'" @click="getRegisteredUsers"
        :size="isSmallScreen ? 'x-small' : 'small'" :loading="isGettingRegisteredUsers" />
    </v-col>

    <v-col cols="12" lg="10">
      <v-data-table :headers="header_registered_users" :loading="isGettingRegisteredUsers" :items="registeredUsers"
        class="admin-data-table rounded-lg w-100" items-per-page-text="Sayfa Başı Kullanıcı Sayısı" hover>
        <template #item="{ item, index }">
          <tr class="table-row">
            <td>
              <div 
                class="d-flex align-center ga-1 ga-lg-2 py-2 cursor-pointer"
                @click="goToProfile(item)"
              >
                <v-icon icon="mdi-account" size="small" />
                <p class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter">
                  {{ item.username }}
                </p>
                <v-icon icon="mdi-open-in-new" size="x-small" color="grey-darken-1" />
              </div>
            </td>

            <td>
              <v-chip prepend-icon="mdi-email" size="small" variant="tonal" :text="item.email" :ripple="false" />
            </td>

            <td>
              <v-chip 
                v-if="item.steamId" 
                prepend-icon="mdi-steam" 
                size="small" 
                variant="tonal" 
                color="blue-grey-lighten-1"
                :text="item.steamId" 
                :ripple="false" 
              />
              <v-chip 
                v-else 
                prepend-icon="mdi-alert-circle" 
                size="small" 
                variant="outlined" 
                color="grey-darken-1"
                text="Steam ID Yok" 
                :ripple="false" 
              />
            </td>

            <td>
              <v-chip prepend-icon="mdi-clock-time-nine-outline" size="small" variant="outlined" color="grey-lighten-1"
                :text="formatDateTR(item.createdAt)" :ripple="false" />
            </td>

            <td>
              <div class="d-flex justify-start align-center ga-1">
                <v-btn @click.stop="handleEditSteamId(item)" variant="tonal" prepend-icon="mdi-steam" text="Steam ID"
                  class="text-caption text-lg-subtitle-2 default-title-letter rounded" size="small" color="blue-grey-lighten-1"
                  :block="display.xs.value" />
                <v-btn @click.stop="handleDeleteUser(item)" variant="tonal" prepend-icon="mdi-delete" text="Sil"
                  class="text-caption text-lg-subtitle-2 default-title-letter rounded" size="small" color="error"
                  :block="display.xs.value" />
              </div>
            </td>
          </tr>
        </template>

        <template #loading>
          <v-skeleton-loader class="bg-transparent" :type="registeredUsers?.length > 10
            ? 'table-row@10'
            : `table-row@${registeredUsers?.length}`
            " />
        </template>
      </v-data-table>
    </v-col>

    <!-- Messages -->
    <v-col cols="12" lg="10" class="d-flex justify-space-between align-center">
      <div class="d-flex align-center justify-center justify-sm-start ga-2 ga-lg-5 mt-2 mt-lg-5">
        <Animated_Text :text="`Gelen Mesajlar (${messages?.length})`" class="cursor-pointer" :msPerChar="50"
          :duration="550" :loop="true" />
      </div>

      <v-btn icon="mdi-refresh" class="rounded text-caption text-lg-subtitle-2" :ripple="false" variant="text"
        rounded="xl" :color="isGettingRegisteredUsers ? 'green-accent-2' : 'grey-lighten-1'" @click="getRegisteredUsers"
        :size="isSmallScreen ? 'x-small' : 'small'" :loading="isGettingRegisteredUsers" />
    </v-col>

    <v-col cols="12" lg="10">
      <v-data-table :headers="header_messages" :loading="isGettingMessages" :items="messages"
        class="admin-data-table rounded-lg w-100" items-per-page-text="Sayfa Başı Mesaj Sayısı" hover>
        <template #item="{ item, index }">
          <tr class="table-row">
            <td>
              <div class="d-flex align-center ga-1 ga-lg-2 py-2">
                <v-icon icon="mdi-account" size="small" />
                <p class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter">
                  {{ item.name }}
                </p>
              </div>
            </td>

            <td>
              <v-chip prepend-icon="mdi-email" size="small" variant="tonal" :text="item.email" :ripple="false" />
            </td>

            <td>
              <v-chip prepend-icon="mdi-clock-time-nine-outline" size="small" variant="outlined" color="grey-lighten-1"
                :text="formatDateTR(item.createdAt)" :ripple="false" />
            </td>

            <td>
              <div class="d-flex justify-start align-center ga-1">
                <v-btn @click.stop="handleDeleteMsg(item)" variant="tonal" prepend-icon="mdi-delete" text="Sil"
                  class="text-caption text-lg-subtitle-2 default-title-letter rounded" size="small" color="error"
                  block />
              </div>
            </td>
          </tr>
        </template>

        <template #loading>
          <v-skeleton-loader class="bg-transparent" :type="registeredUsers?.length > 10
            ? 'table-row@10'
            : `table-row@${registeredUsers?.length}`
            " />
        </template>
      </v-data-table>
    </v-col>

    <!-- Steam ID Edit Dialog -->
    <v-dialog v-model="isOpenSteamIdDialog" :max-width="500"
      style="background-color: rgba(0, 0, 0, 0.85); backdrop-filter: blur(0.1rem); -webkit-backdrop-filter: blur(0.1rem);">
      <div class="steam-id-dialog d-flex flex-column align-start ga-2 ga-lg-4 rounded pa-2 pa-lg-5">
        <v-btn @click="isOpenSteamIdDialog = false" icon="mdi-close" color="grey-darken-1" class="close-btn ma-1"
          variant="text" size="small" :ripple="false" />

        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-steam" color="blue-grey-lighten-1" size="large" />
          <p class="text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-grey-lighten-1 default-title-letter">
            Steam ID Ekle/Güncelle
          </p>
        </div>

        <v-divider color="white" class="w-100" />

        <div class="w-100 d-flex flex-column ga-2">
          <p class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter">
            Kullanıcı: <strong>{{ activeUser?.username }}</strong>
          </p>
          <p class="text-caption text-grey-darken-1">
            Steam ID'yi bulmak için: Steam profil sayfanızın URL'sindeki sayıyı kopyalayın.
            <br />
            Örnek: https://steamcommunity.com/profiles/<strong>76561198000000000</strong>
          </p>

          <v-text-field 
            v-model="steamIdInput" 
            prepend-inner-icon="mdi-steam"
            variant="outlined"
            class="w-100 text-grey-lighten-1" 
            color="grey-lighten-1" 
            rounded="xl" 
            label="Steam ID"
            placeholder="76561198000000000"
            :density="display.lgAndUp.value ? 'comfortable' : 'compact'" 
            clearable
            :rules="steamIdRules"
          />
        </div>

        <div class="w-100 d-flex align-center justify-end ga-1 mt-2">
          <v-btn @click="isOpenSteamIdDialog = false" :ripple="false" class="rounded"
            :size="display.lgAndUp.value ? 'default' : 'small'" color="grey-lighten-2" variant="text"
            prepend-icon="mdi-close" text="İptal" />

          <v-btn @click="saveSteamId" :loading="isSavingSteamId" :ripple="false" class="rounded" color="blue-grey-lighten-1"
            :size="display.lgAndUp.value ? 'default' : 'small'" variant="tonal" prepend-icon="mdi-content-save" text="Kaydet" />
        </div>
      </div>
    </v-dialog>

    <!-- Success Toast -->
    <v-dialog v-model="isShowSuccessToast" :max-width="600"
      style="background-color: rgba(0, 0, 0, 0.85); backdrop-filter: blur(0.1rem); -webkit-backdrop-filter: blur(0.1rem);">
      <div class="successfully-done-container d-flex flex-column align-center justify-center pa-5 rounded-xl">
        <v-btn @click="isShowSuccessToast = false"
          class="close-icon-in-successfully-done-container ma-1 ma-lg-2" icon="mdi-close" :ripple="false" variant="text"
          color="grey-darken-1" size="small" />
        <v-icon icon="mdi-check-circle" color="success" size="64" />
        <p class="text-subtitle-2 text-lg-subtitle-1 text-grey-lighten-1 default-title-letter">
          {{ successMessage }}
        </p>
      </div>
    </v-dialog>
  </v-row>
</template>
<script lang="ts" setup>
import { collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { useFirestoreDateFormatted } from "~/composables/data/handleData";
import {
  header_messages,
  header_registered_users,
} from "~/composables/data/headerTables";
import Animated_Text from "../common/Animated_Text.vue";

const router = useRouter();
const { $firestore } = useNuxtApp();
const { formatDateTR } = useFirestoreDateFormatted();

const display = useDisplay();
const isSmallScreen = computed(() => display.smAndDown.value);

const goToProfile = (user: any) => {
  if (user?.firestoreId) {
    router.push(`/profile/${user.firestoreId}`);
  }
};

const isGettingRegisteredUsers = ref(false);
const isGettingMessages = ref(false);
const isOpenSteamIdDialog = ref(false);
const isSavingSteamId = ref(false);
const isShowSuccessToast = ref(false);
const successMessage = ref("");

const registeredUsers = ref<any[]>([]);
const messages = ref<any[]>([]);
const activeUser = ref<any | null>(null);
const steamIdInput = ref("");

const steamIdRules = [
  (v: string) => !!v || "Steam ID gerekli",
  (v: string) => /^\d{17}$/.test(v) || "Steam ID 17 haneli sayı olmalıdır",
];

const getRegisteredUsers = async () => {
  try {
    isGettingRegisteredUsers.value = true;

    const registeredUserCol = collection($firestore, "registered_users");
    const registeredUserSnapshot = await getDocs(registeredUserCol);

    const registeredUsersList = registeredUserSnapshot.docs.map((doc) => ({
      firestoreId: doc.id,
      ...doc.data(),
    }));

    registeredUsers.value = registeredUsersList;
  } catch (error: any) {
    console.error("Error while getting registered users : ", error.message);
  } finally {
    isGettingRegisteredUsers.value = false;
  }
};

const getMessages = async () => {
  try {
    isGettingMessages.value = true;

    const messagesCol = collection($firestore, "messages");
    const messagesSnapshot = await getDocs(messagesCol);

    const messagesList = messagesSnapshot.docs.map((doc) => ({
      firestoreId: doc.id,
      ...doc.data(),
    }));

    messages.value = messagesList;
  } catch (error: any) {
    console.error("Error while getting registered users : ", error.message);
  } finally {
    isGettingMessages.value = false;
  }
};

const handleEditSteamId = (user: any) => {
  activeUser.value = user;
  steamIdInput.value = user.steamId || "";
  isOpenSteamIdDialog.value = true;
};

const saveSteamId = async () => {
  if (!steamIdInput.value || !/^\d{17}$/.test(steamIdInput.value)) {
    return;
  }

  if (!activeUser.value?.firestoreId) {
    return;
  }

  try {
    isSavingSteamId.value = true;

    const userDocRef = doc($firestore, "registered_users", activeUser.value.firestoreId);
    await updateDoc(userDocRef, {
      steamId: steamIdInput.value,
      updatedAt: serverTimestamp(),
    });

    successMessage.value = "Steam ID başarıyla kaydedildi!";
    isShowSuccessToast.value = true;

    setTimeout(() => {
      isShowSuccessToast.value = false;
      isOpenSteamIdDialog.value = false;
    }, 2000);

    await getRegisteredUsers();
  } catch (error: any) {
    console.error("Steam ID kaydetme hatası:", error);
    successMessage.value = "Hata oluştu: " + error.message;
    isShowSuccessToast.value = true;

    setTimeout(() => {
      isShowSuccessToast.value = false;
    }, 3000);
  } finally {
    isSavingSteamId.value = false;
  }
};

const handleDeleteUser = (user: any) => {
  console.log(user);
};

const handleDeleteMsg = (msg: any) => {
  console.log(msg);
};

onMounted(() => {
  getRegisteredUsers();
  getMessages();
});
</script>
<style scoped>
@import url("~/assets/css/main.css");
@import url("~/assets/css/admin.css");
</style>
