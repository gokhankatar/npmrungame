<template>
  <template v-if="_store.isAdmin">
    <Admin_Sidebar />
    <v-main class="admin-v-main">
      <NuxtPage />
    </v-main>
  </template>
  <template v-else>
    <NuxtPage />
  </template>
  <Scroll_To_Top />
</template>

<script lang="ts" setup>
import Scroll_To_Top from "~/components/common/Scroll_To_Top.vue";
import Admin_Sidebar from "~/components/admin/Admin_Sidebar.vue";
import store from "~/store/store";

const _store = store();
</script>

<style scoped>
@import url("~/assets/css/admin.css");
@import url("~/assets/css/admin_collection_page.css");
</style>
