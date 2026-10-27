<script setup lang="ts">
import PlatformComingSoon from "~/components/panel/PlatformComingSoon.vue";
import { useAppLocale } from "~/composables/useAppLocale";

definePageMeta({
  layout: "panel",
  ssr: false,
  middleware: "auth",
});

const { tx } = useAppLocale();

useSeoMeta({
  title: () => `${tx("panel.nav.platforms.playstation")} | npmrungame`,
  robots: "noindex, nofollow",
});
</script>

<template>
  <PlatformComingSoon
    platform="playstation"
    icon="mdi-sony-playstation"
    :title="tx('panel.nav.platforms.playstation')"
    :blurb="tx('panel.platformSoon.psn.blurb')"
  />
</template>
