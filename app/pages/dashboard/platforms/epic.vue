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
  title: () => `${tx("panel.nav.platforms.epic")} | npmrungame`,
  robots: "noindex, nofollow",
});
</script>

<template>
  <PlatformComingSoon
    platform="epic"
    icon="mdi-storefront-outline"
    :title="tx('panel.nav.platforms.epic')"
    :blurb="tx('panel.platformSoon.epic.blurb')"
  />
</template>
