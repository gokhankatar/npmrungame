<template>
    <v-row class="d-flex justify-center align-center mx-auto mt-5 mt-lg-10">
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
                    rounded="xl" :color="isGettingNotifications ? 'green-accent-2' : 'grey-lighten-1'"
                    @click="getNotifications" :size="display.smAndDown.value ? 'x-small' : 'small'"
                    :loading="isGettingNotifications" />
            </div>
        </v-col>

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

        <v-col cols="12" lg="10">
            <v-list class="w-100 rounded bg-transparent" :density="display.mdAndDown.value ? 'compact' : 'comfortable'">
                <template v-if="notifications?.length">

                    <v-list-group v-for="item in notifications" :key="item.id" :value="item.id"
                        @click="handleExpand(item)" class="notification-item rounded">
                        <!-- HEADER -->
                        <template #activator="{ props }">
                            <v-list-item v-bind="props" class="rounded">
                                <div class="d-flex flex-column align-start ga-1">
                                    <p class="text-caption text-lg-subtitle-2 default-title-letter">
                                        🎮 {{ item.game_name }}
                                    </p>
                                    <v-chip :text="item.status" size="x-small"
                                        :color="item.status == 'recommended_game' ? 'deep-purple' : 'grey-lighten-1'"
                                        :ripple="false" />
                                </div>

                                <!-- GREEN DOT -->
                                <template #append>
                                    <span v-if="!item.read_status" class="unread-dot" />
                                </template>
                            </v-list-item>
                        </template>

                        <!-- EXPANDED -->
                        <v-list-item class="pl-6">
                            <v-list-item-subtitle>
                                <strong>Öneren:</strong> {{ item.recommender_name }}
                            </v-list-item-subtitle>

                            <v-list-item-subtitle>
                                <strong>E-posta:</strong> {{ item.recommender_email }}
                            </v-list-item-subtitle>

                            <v-list-item-subtitle class="text-grey-lighten-1">
                                {{ new Date(item.created_at).toLocaleString() }}
                            </v-list-item-subtitle>
                        </v-list-item>

                    </v-list-group>
                </template>

                <template v-else>
                    <v-list-item>
                        <v-list-item-title class="text-caption text-grey-lighten-1">
                            Henüz bildirim yok
                        </v-list-item-title>
                    </v-list-item>
                </template>
            </v-list>
        </v-col>
    </v-row>
</template>
<script lang="ts" setup>
import Animated_Text from '../common/Animated_Text.vue';
import _ from "lodash";
import {
    doc,
    getDocs,
    collection,
    deleteDoc,
    addDoc,
    updateDoc,
} from "firebase/firestore";

const { $firestore } = useNuxtApp();

const display = useDisplay()

const isGettingNotifications = ref(false)
const notifications = ref<any[]>([])

const getNotifications = async () => {
    try {
        isGettingNotifications.value = true

        const notificationsCol = collection($firestore, "notifications");
        const notificationsSnapshot = await getDocs(notificationsCol);

        const notificationsList = notificationsSnapshot.docs.map((doc) => ({
            firestoreId: doc.id,
            ...doc.data(),
        }));

        notifications.value = notificationsList;
    } catch (error: any) {
        console.error("While get notificitions error : ", error.messag)
    } finally {
        isGettingNotifications.value = false
    }
}

const handleExpand = async (item: any) => {
    if (item.read_status) return

    item.read_status = true

    try {
        await updateDoc(
            doc($firestore, 'notifications', item.id),
            { read_status: true }
        )
    } catch (err) {
        console.error('Read status update failed', err)
    }
}

const sortNotifications = (arr: any[], type: "new" | "old") => {
    if (!arr || arr?.length === 0) return [];

    const sorted = _.sortBy(notifications.value, (n: any) => n?.createdAt ?? 0);
    return type === "new" ? sorted.reverse() : sorted;
};

const sortBy = (mode: string) => {
    if (mode === "new") notifications.value = sortNotifications(notifications.value, "new");
    if (mode === "old") notifications.value = sortNotifications(notifications.value, "old");
};

onMounted(() => {
    getNotifications()
})
</script>

<style scoped>
@import url("~/assets/css/main.css");
@import url("~/assets/css/admin.css");
</style>