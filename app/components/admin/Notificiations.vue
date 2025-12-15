<template>
    <v-row class="d-flex justify-center align-center mx-auto mt-5 mt-lg-10">

        <!-- Header -->
        <v-col cols="12" lg="10" class="d-flex justify-space-between align-center">
            <div class="d-flex align-center justify-center justify-sm-start ga-2 ga-lg-5 mt-2 mt-lg-5">
                <Animated_Text text="Bildirim Merkezi" class="cursor-pointer" :msPerChar="50" :duration="550"
                    :loop="true" />
            </div>

            <div class="d-flex align-center ga-1 ga-lg-2">
                <v-menu :close-on-content-click="true" :offset="[5, 10]" location="bottom end">
                    <template #activator="{ props }">
                        <v-btn v-if="!display.xs.value" v-bind="props" icon="mdi-sort"
                            class="rounded text-caption text-lg-subtitle-2" :ripple="false" variant="text" rounded="xl"
                            color="grey-lighten-1" :size="display.smAndDown.value ? 'x-small' : 'small'" />
                    </template>

                    <v-card class="pa-1 pa-sm-2" :ripple="false" style="
              background: rgba(0, 0, 0, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.15);
              backdrop-filter: blur(0.5rem);
              -webkit-backdrop-filter: blur(0.5rem);
            " elevation="2">
                        <v-list density="compact" class="bg-transparent">
                            <v-list-item @click="sortBy('new')" prepend-icon="mdi-arrow-up">
                                <v-list-item-title class="text-caption text-sm-subtitle-2 text-grey-lighten-1">Tarihe
                                    Göre En
                                    Yeni</v-list-item-title>
                            </v-list-item>

                            <v-list-item @click="sortBy('old')" :ripple="false" prepend-icon="mdi-arrow-down">
                                <v-list-item-title class="text-caption text-sm-subtitle-2 text-grey-lighten-1">Tarihe
                                    Göre En
                                    Eski</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-card>
                </v-menu>
                <v-btn icon="mdi-refresh" class="rounded text-caption text-lg-subtitle-2" :ripple="false" variant="text"
                    rounded="xl" :color="notificationStore.isLoading ? 'green-accent-2' : 'grey-lighten-1'"
                    @click="notificationStore.fetchNotifications($firestore)"
                    :size="display.smAndDown.value ? 'x-small' : 'small'" :loading="notificationStore.isLoading" />
            </div>
        </v-col>

        <!-- Filter Actions -->
        <v-col cols="12" v-if="display.xs.value">
            <v-menu :close-on-content-click="true" :offset="[5, 0]" location="bottom end">
                <template #activator="{ props }">
                    <v-btn prepend-icon="mdi-sort" v-bind="props" class="text-caption text-lg-subtitle-2"
                        :ripple="false" text="Sırala" variant="tonal" rounded="xl" color="grey-lighten-1" size="small"
                        block />
                </template>

                <v-card class="pa-1 pa-sm-2" :ripple="false" style="
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(0.5rem);
            -webkit-backdrop-filter: blur(0.5rem);
          " elevation="2">
                    <v-list density="compact" class="bg-transparent">
                        <v-list-item @click="sortBy('new')" prepend-icon="mdi-arrow-up">
                            <v-list-item-title class="text-caption text-sm-subtitle-2 text-grey-lighten-1">Tarihe Göre
                                En
                                Yeni</v-list-item-title>
                        </v-list-item>

                        <v-list-item @click="sortBy('old')" :ripple="false" prepend-icon="mdi-arrow-down">
                            <v-list-item-title class="text-caption text-sm-subtitle-2 text-grey-lighten-1">Tarihe Göre
                                En
                                Eski</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-menu>
        </v-col>

        <!-- All Notifications -->
        <v-col cols="12" lg="10">
            <v-list class="w-100 rounded bg-transparent" :density="display.mdAndDown.value ? 'compact' : 'comfortable'">
                <!-- 🔄 LOADING -->
                <template v-if="notificationStore.isLoading">
                    <v-list-item v-for="i in 3" :key="i" class="my-2">
                        <v-skeleton-loader type="list-item-two-line" class="w-100" />
                    </v-list-item>
                </template>

                <!-- 📋 DATA -->
                <template v-else-if="notifications.length">
                    <v-list-group v-for="item of notifications" :key="item.id" :value="item.id"
                        @click="handleExpand(item)" class="notification-item rounded my-2">
                        <!-- HEADER -->
                        <template #activator="{ props }">
                            <v-list-item v-bind="props" class="rounded">
                                <div class="d-flex flex-column align-start ga-1">
                                    <p class="text-caption text-lg-subtitle-2 default-title-letter">
                                        🎮 {{ item.game_name }}
                                    </p>

                                    <v-chip :text="item.status" size="x-small" :color="item.status === 'recommended_game'
                                        ? 'deep-purple'
                                        : 'grey-lighten-1'" :ripple="false" />
                                </div>

                                <!-- GREEN DOT -->
                                <template #append>
                                    <span v-if="!item.read_status" class="unread-dot" />
                                </template>
                            </v-list-item>
                        </template>

                        <!-- EXPANDED -->
                        <v-list-item class="pl-3 pl-lg-6">
                            <v-list-item-subtitle>
                                <p class="text-caption text-lg-subtitle-2 text-grey-lighten-1">
                                    <strong>Öneren:</strong> {{ item.recommender_name }}
                                </p>
                            </v-list-item-subtitle>

                            <v-list-item-subtitle>
                                <p class="text-caption text-lg-subtitle-2 text-grey-lighten-1">
                                    <strong>E-posta:</strong> {{ item.recommender_email }}
                                </p>
                            </v-list-item-subtitle>

                            <v-list-item-subtitle>
                                <p class="text-start text-sm-end text-caption text-lg-subtitle-2 text-grey-lighten-1">
                                    {{ new Date(item.created_at).toLocaleString() }}
                                </p>
                            </v-list-item-subtitle>
                        </v-list-item>
                    </v-list-group>
                </template>

                <!-- 📭 EMPTY -->
                <template v-else>
                    <v-list-item>
                        <v-list-item-title class="text-caption text-grey-lighten-1">
                            Henüz bildirim yok
                        </v-list-item-title>
                    </v-list-item>
                </template>
            </v-list>
        </v-col>

        <!-- Action Buttons -->
        <v-col cols="12" lg="10">
            <!-- 🔄 LOADING -->
            <template v-if="notificationStore.isLoading">
                <v-row class="d-flex justify-center justify-sm-end align-center" :dense="display.smAndDown.value">
                    <v-col cols="12" sm="6" lg="4" xl="3">
                        <v-skeleton-loader type="button" class="w-100" />
                    </v-col>

                    <v-col cols="12" sm="6" lg="4" xl="3">
                        <v-skeleton-loader type="button" class="w-100" />
                    </v-col>
                </v-row>
            </template>

            <!-- ✅ ACTIONS -->
            <template v-else-if="notificationStore.notifications?.length > 0">
                <v-row class="d-flex justify-center justify-sm-end align-center" :dense="display.smAndDown.value">
                    <v-col cols="12" sm="6" lg="4" xl="3">
                        <v-btn @click="notificationStore.markAllAsRead($firestore)" prepend-icon="mdi-check-all"
                            text="Tümünü Okundu İşaretle" class="text-caption text-xl-subtitle-2 default-title-letter"
                            :size="display.xs.value ? 'small' : 'default'" :ripple="false" color="primary"
                            variant="tonal" block />
                    </v-col>

                    <v-col cols="12" sm="6" lg="4" xl="3">
                        <v-btn @click="isOpenConfirmationDialog = true" prepend-icon="mdi-delete" text="Tümünü Sil"
                            class="text-caption text-xl-subtitle-2 default-title-letter"
                            :size="display.xs.value ? 'small' : 'default'" :ripple="false" color="error" variant="tonal"
                            block />
                    </v-col>
                </v-row>
            </template>
        </v-col>
    </v-row>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="isOpenConfirmationDialog" :max-width="600" style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.7rem);
      -webkit-backdrop-filter: blur(0.7rem);
    ">
        <div
            class="delete-confirmation-notifications d-flex flex-column align-start ga-1 ga-lg-3 pa-3 pa-md-5 pa-lg-10 rounded-lg w-100">
            <div class="d-flex align-center ga-1 ga-lg-2">
                <v-img :src="deleteAnim" :width="display.smAndDown.value ? 30 : 50" />
                <p class="text-subtitle-2 text-md-subtitle-1 text-xl-h5 default-title-letter text-grey-lighten-1">
                    Tüm Bildirimleri Silmek İstediğine Emin Misin?
                </p>
            </div>

            <v-divider color="white" class="w-100" />

            <div class="w-100 d-flex align-center justify-end ga-1 mt-2">
                <v-btn @click="isOpenConfirmationDialog = false" :ripple="false" class="rounded"
                    :size="display.lgAndUp.value ? 'default' : 'small'" color="grey-lighten-2" variant="text"
                    prepend-icon="mdi-close" text="Iptal" />

                <v-btn @click="notificationStore.deleteAll($firestore)" :loading="notificationStore.isLoading"
                    :ripple="false" class="rounded" color="error" :size="display.lgAndUp.value ? 'default' : 'small'"
                    variant="tonal" prepend-icon="mdi-delete" text="Evet" />
            </div>
        </div>
    </v-dialog>
</template>
<script lang="ts" setup>
import Animated_Text from '../common/Animated_Text.vue';
import _ from "lodash";
import { useNotificationsStore } from '~/store/notifications';
import deleteAnim from "~/assets/img/deleted_anim.gif"

const { $firestore } = useNuxtApp();

const display = useDisplay()
const notificationStore = useNotificationsStore()

const isOpenConfirmationDialog = ref(false)

const notifications = computed(
    () => notificationStore.notifications
)

const handleExpand = (item: any) => {
    notificationStore.markAsRead($firestore, item.id)
}

const sortBy = (mode: 'new' | 'old') => {
    notificationStore.notifications = [...notificationStore.notifications].sort(
        (a, b) => {
            const da = new Date(a.created_at).getTime()
            const db = new Date(b.created_at).getTime()
            return mode === 'new' ? db - da : da - db
        }
    )
}

onMounted(() => {
    notificationStore.fetchNotifications($firestore)
})
</script>

<style scoped>
@import url("~/assets/css/main.css");
@import url("~/assets/css/admin.css");
</style>