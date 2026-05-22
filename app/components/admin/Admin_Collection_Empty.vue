<template>
  <section class="admin-empty-state default-title-letter" :style="accentVars">
    <div class="admin-empty-state__glow" aria-hidden="true" />

    <div class="admin-empty-state__icon-ring">
      <v-icon :icon="icon" size="40" />
    </div>

    <h2 class="admin-empty-state__title">{{ title }}</h2>
    <p class="admin-empty-state__desc">{{ description }}</p>

    <ul v-if="tips.length" class="admin-empty-state__tips">
      <li v-for="(tip, index) in tips" :key="index">
        <v-icon :icon="tip.icon" size="18" class="admin-empty-state__tip-icon" />
        <span>{{ tip.text }}</span>
      </li>
    </ul>

    <div class="admin-empty-state__actions">
      <v-btn
        v-if="primaryActionText"
        :color="accentColor"
        variant="flat"
        rounded="xl"
        :prepend-icon="primaryActionIcon"
        class="text-capitalize admin-empty-state__btn-primary"
        :ripple="false"
        @click="emit('primary-action')"
      >
        {{ primaryActionText }}
      </v-btn>
      <v-btn
        v-if="secondaryActionText"
        variant="tonal"
        rounded="xl"
        class="text-capitalize"
        :ripple="false"
        @click="emit('secondary-action')"
      >
        {{ secondaryActionText }}
      </v-btn>
    </div>
  </section>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    icon?: string;
    title: string;
    description: string;
    tips?: { icon: string; text: string }[];
    primaryActionText?: string;
    primaryActionIcon?: string;
    secondaryActionText?: string;
    /** hex, örn. #69f0ae */
    accentColor?: string;
    /** rgb triplet, örn. "105, 240, 174" */
    accentRgb?: string;
  }>(),
  {
    icon: "mdi-gamepad-variant-outline",
    tips: () => [],
    primaryActionIcon: "mdi-plus",
    accentColor: "#69f0ae",
    accentRgb: "105, 240, 174",
  }
);

const emit = defineEmits<{
  "primary-action": [];
  "secondary-action": [];
}>();

const accentVars = computed(() => ({
  "--empty-accent": props.accentColor,
  "--empty-accent-rgb": props.accentRgb,
}));
</script>

<style scoped>
@import "~/assets/css/admin_collection_page.css";
</style>
