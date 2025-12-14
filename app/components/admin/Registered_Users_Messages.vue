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
              <div class="d-flex align-center ga-1 ga-lg-2 py-2">
                <v-icon icon="mdi-account" size="small" />
                <p class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter">
                  {{ item.username }}
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
                <v-btn @click.stop="handleDeleteUser(item)" variant="tonal" prepend-icon="mdi-delete" text="Sil"
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
  </v-row>
</template>
<script lang="ts" setup>
import { collection, deleteDoc, doc, getDocs, serverTimestamp } from "firebase/firestore";
import { useFirestoreDateFormatted } from "~/composables/data/handleData";
import {
  header_messages,
  header_registered_users,
} from "~/composables/data/headerTables";
import Animated_Text from "../common/Animated_Text.vue";

const { $firestore } = useNuxtApp();
const { formatDateTR } = useFirestoreDateFormatted();

const display = useDisplay();
const isSmallScreen = computed(() => display.smAndDown.value);

const isGettingRegisteredUsers = ref(false);
const isGettingMessages = ref(false);

const registeredUsers = ref<any[]>([]);
const messages = ref<any[]>([]);

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
