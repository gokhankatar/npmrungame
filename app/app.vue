<script lang="ts" setup>
import store from "./store/store";

const _store = store();
</script>

<template>
  <v-app :theme="_store.theme">
    <v-main>
      <v-container>
        <NuxtLayout />
      </v-container>
    </v-main>
  </v-app>
</template>
