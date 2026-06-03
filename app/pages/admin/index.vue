<template>
  <v-container
    class="admin-content pa-0"
    :class="isCompactNav ? 'pt-3' : 'pt-4 pt-lg-6'"
    fluid
  >
    <Dashboard v-if="_store.active_admin_list_item == 'dashboard'" />
    <Notificiations v-if="_store.active_admin_list_item == 'notifications'" />
    <Completed_Games v-if="_store.active_admin_list_item == 'completed_games'" />
    <Blogs v-if="_store.active_admin_list_item == 'blog'" />
    <Current_Games v-if="_store.active_admin_list_item == 'current_games'" />
    <Registered_Users_Messages v-if="_store.active_admin_list_item == 'messages'" />
    <Recommended_Games v-if="_store.active_admin_list_item == 'recommended_games'" />
    <Upcoming_Games v-if="_store.active_admin_list_item == 'upcoming_games'" />
    <Settings v-if="_store.active_admin_list_item == 'settings'" />
  </v-container>
</template>

<script lang="ts" setup>
import store from "~/store/store";
import Dashboard from "~/components/admin/Dashboard.vue";
import Completed_Games from "~/components/admin/Completed_Games.vue";
import Blogs from "~/components/admin/Blogs.vue";
import Current_Games from "~/components/admin/Current_Games.vue";
import Registered_Users_Messages from "~/components/admin/Registered_Users_Messages.vue";
import Recommended_Games from "~/components/admin/Recommended_Games.vue";
import Upcoming_Games from "~/components/admin/Upcoming_Games.vue";
import Notificiations from "~/components/admin/Notificiations.vue";
import Settings from "~/components/admin/Settings.vue";

definePageMeta({
  layout: "admin",
});

useHead({
  title: "npmrungame | Admin",
});

const _store = store();
const router = useRouter();
const display = useDisplay();
const isCompactNav = computed(() => display.smAndDown.value);

watch(
  () => _store.isAdmin,
  (isAdmin) => {
    if (!isAdmin) router.replace("/admin-login");
  },
  { immediate: true }
);
</script>

<style scoped>
@import url("~/assets/css/main.css");
@import url("~/assets/css/admin.css");
</style>
