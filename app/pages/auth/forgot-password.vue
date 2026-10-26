<script setup lang="ts">
import { useAppLocale } from "~/composables/useAppLocale";

definePageMeta({
  layout: "auth",
  middleware: "guest",
});

const { tx } = useAppLocale();
const { sendPasswordReset, pending, error } = useFirebaseAuth();

const email = ref("");
const sent = ref(false);

useSeoMeta({
  title: () => `${tx("auth.forgot.title")} | npmrungame`,
  description: () => tx("auth.forgot.subtitle"),
});

async function onSubmit() {
  sent.value = false;
  try {
    await sendPasswordReset(email.value);
    sent.value = true;
  } catch {
    /* error already set */
  }
}
</script>

<template>
  <div class="auth-form">
    <div class="auth-form__brand">
      <img
        src="/media/brand/channel-avatar.jpg"
        alt="npmrungame"
        class="auth-form__logo"
      />
      <h1 class="auth-form__title">{{ tx("auth.forgot.title") }}</h1>
      <p class="auth-form__subtitle">{{ tx("auth.forgot.subtitle") }}</p>
    </div>

    <div v-if="sent" class="auth-form__success" role="status">
      {{ tx("auth.forgot.success") }}
    </div>

    <form
      v-else
      class="auth-form__fields"
      @submit.prevent="onSubmit"
    >
      <div class="auth-form__field">
        <label for="forgot-email">{{ tx("auth.email") }}</label>
        <input
          id="forgot-email"
          v-model="email"
          type="email"
          name="email"
          autocomplete="email"
          required
          :disabled="pending"
          :placeholder="tx('auth.email.placeholder')"
        />
      </div>

      <div v-if="error" class="auth-form__error" role="alert">{{ error }}</div>

      <button type="submit" class="auth-form__submit" :disabled="pending">
        <span v-if="!pending">{{ tx("auth.forgot.submit") }}</span>
        <span v-else class="auth-form__wait">
          <span class="auth-form__spinner" aria-hidden="true" />
          {{ tx("auth.wait") }}
        </span>
      </button>
    </form>

    <p class="auth-form__back">
      <NuxtLink to="/auth/login">← {{ tx("auth.backToLogin") }}</NuxtLink>
    </p>
  </div>
</template>

<style>
@import url("~/assets/css/auth-form.css");
</style>
