<template>
  <div class="admin-shell" :class="{ 'admin-shell--hidden': showLoadingOverlay }">
    <template v-if="_store.isAdmin">
      <Admin_Sidebar />
      <v-main class="admin-v-main">
        <NuxtPage />
      </v-main>
    </template>
    <template v-else>
      <NuxtPage />
    </template>
  </div>

  <Transition name="admin-loading-fade">
    <Admin_Loading v-if="showLoadingOverlay" />
  </Transition>

  <Scroll_To_Top v-if="shellReady || !_store.isAdmin" />
</template>

<script lang="ts" setup>
import Scroll_To_Top from "~/components/common/Scroll_To_Top.vue";
import Admin_Sidebar from "~/components/admin/Admin_Sidebar.vue";
import Admin_Loading from "~/components/admin/Admin_Loading.vue";
import { useAdminShellReady } from "~/composables/admin/useAdminShellReady";
import store from "~/store/store";

const _store = store();
const { shellReady, waitForAdminShell, resetShell } = useAdminShellReady();

const showLoadingOverlay = computed(() => _store.isAdmin && !shellReady.value);

const bootShell = async () => {
  resetShell();
  await waitForAdminShell();
};

watch(
  () => _store.isAdmin,
  (isAdmin) => {
    if (isAdmin) bootShell();
    else shellReady.value = true;
  },
  { immediate: true }
);

onMounted(() => {
  if (_store.isAdmin) bootShell();
});
</script>

<style scoped>
@import url("~/assets/css/admin.css");
@import url("~/assets/css/admin_collection_page.css");
@import url("~/assets/css/admin_login.css");
</style>
