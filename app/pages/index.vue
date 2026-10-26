<script setup lang="ts">
/**
 * Panel entry gate — asıl yönlendirme panel.global middleware'de.
 * Auth resolve olana kadar loading; flash marketing olmasın.
 */
definePageMeta({
  layout: false,
});

const { waitForAuth } = useAuthReady();

onMounted(async () => {
  const uid = await waitForAuth();
  await navigateTo(uid ? "/dashboard" : "/auth/login", { replace: true });
});
</script>

<template>
  <CommonLoading />
</template>
