<template>
  <v-card
    class="home-newsletter-block"
    :class="{ 'home-newsletter-block--compact': compact }"
    elevation="0"
    rounded="xl"
    :ripple="false"
  >
    <div class="home-newsletter-inner">
      <div class="home-newsletter-copy">
        <v-icon :icon="compact ? 'mdi-bell-ring' : 'mdi-bell'" color="#69f0ae" :size="compact ? 22 : 28" />
        <div>
          <p class="home-newsletter-title default-title-letter">
            {{ compact ? "Gelişmeleri kaçırma" : "Gelişmelerden Haberdar Olun" }}
          </p>
          <p class="home-newsletter-desc text-grey-lighten-1 mb-0">
            {{
              compact
                ? "Yeni oyun ve bloglar için e-posta bırak."
                : "Yeni oyunlar, bloglar, ödüller ve önemli gelişmelerden haberdar olmak için e-posta adresini bırak."
            }}
          </p>
        </div>
      </div>

      <form class="home-newsletter-form" @submit.prevent="$emit('submit')">
        <v-text-field
          :model-value="email"
          type="email"
          autocomplete="email"
          placeholder="ornek@email.com"
          variant="solo-filled"
          flat
          hide-details="auto"
          rounded="lg"
          prepend-inner-icon="mdi-email-outline"
          :rules="emailRules"
          :density="compact ? 'compact' : 'comfortable'"
          bg-color="rgba(255, 255, 255, 0.06)"
          color="green-accent-2"
          class="home-newsletter-field default-title-letter flex-grow-1"
          @update:model-value="$emit('update:email', $event)"
          @keyup.enter="$emit('submit')"
        />
        <v-btn
          type="submit"
          :size="compact ? 'default' : 'large'"
          color="green-accent-2"
          variant="elevated"
          rounded="lg"
          :loading="loading"
          :disabled="!emailValid"
          :ripple="false"
          class="text-black font-weight-bold default-title-letter"
          :block="compact && smAndDown"
          append-icon="mdi-arrow-right"
        >
          Kaydol
        </v-btn>
      </form>
    </div>
  </v-card>
</template>

<script lang="ts" setup>
defineProps<{
  email: string;
  emailValid: boolean;
  loading: boolean;
  compact?: boolean;
  emailRules?: ((v: string) => boolean | string)[];
}>();

defineEmits<{
  "update:email": [value: string];
  submit: [];
}>();

const display = useDisplay();
const smAndDown = computed(() => display.smAndDown.value);
</script>

<style scoped>
.home-newsletter-block {
  background: rgba(0, 0, 0, 0.35) !important;
  border: 1px solid rgba(105, 240, 174, 0.2) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.home-newsletter-block--compact {
  border-color: rgba(105, 240, 174, 0.15) !important;
}

.home-newsletter-inner {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.home-newsletter-block:not(.home-newsletter-block--compact) .home-newsletter-inner {
  padding: 1.5rem 1.75rem;
}

@media (min-width: 960px) {
  .home-newsletter-inner {
    flex-direction: row;
    align-items: center;
    gap: 2rem;
  }

  .home-newsletter-copy {
    flex: 1;
  }

  .home-newsletter-form {
    flex: 1.2;
  }
}

.home-newsletter-copy {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.home-newsletter-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
  color: #fff;
}

.home-newsletter-block--compact .home-newsletter-title {
  font-size: 0.9rem;
}

.home-newsletter-desc {
  font-size: 0.78rem;
  line-height: 1.45;
}

.home-newsletter-form {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  width: 100%;
}

@media (min-width: 600px) {
  .home-newsletter-form {
    flex-direction: row;
    align-items: flex-start;
  }
}
</style>
