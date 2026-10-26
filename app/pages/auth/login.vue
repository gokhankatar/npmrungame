<script setup lang="ts">
import { useAppLocale } from "~/composables/useAppLocale";

definePageMeta({
  layout: "auth",
  middleware: "guest",
});

const { tx } = useAppLocale();

useSeoMeta({
  title: () => `${tx("auth.submit.login")} | npmrungame`,
  description: () => tx("auth.login.subtitle"),
});

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const { login, loginWithGoogle, pending, pendingGoogle, error } =
  useFirebaseAuth();

async function onSubmit() {
  try {
    await login(email.value, password.value);
    await navigateTo("/dashboard");
  } catch {
    /* error already set */
  }
}

async function onGoogle() {
  try {
    await loginWithGoogle();
    await navigateTo("/dashboard");
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
      <h1 class="auth-form__title">{{ tx("auth.login.title") }}</h1>
      <p class="auth-form__subtitle">{{ tx("auth.login.subtitle") }}</p>
    </div>

    <form class="auth-form__fields" @submit.prevent="onSubmit">
      <div class="auth-form__field">
        <label for="email">{{ tx("auth.email") }}</label>
        <input
          id="email"
          v-model="email"
          type="email"
          name="email"
          autocomplete="email"
          required
          :disabled="pending || pendingGoogle"
          :placeholder="tx('auth.email.placeholder')"
        />
      </div>

      <div class="auth-form__field">
        <label for="password">{{ tx("auth.password") }}</label>
        <div class="auth-form__password">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            name="password"
            autocomplete="current-password"
            required
            minlength="6"
            :disabled="pending || pendingGoogle"
          />
          <button
            type="button"
            tabindex="-1"
            class="auth-form__eye"
            :disabled="pending || pendingGoogle"
            :aria-label="
              showPassword ? tx('auth.password.hide') : tx('auth.password.show')
            "
            :aria-pressed="showPassword"
            @click="showPassword = !showPassword"
          >
            <svg
              v-if="!showPassword"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="auth-form__forgot">
        <NuxtLink to="/auth/forgot-password">{{ tx("auth.forgot.link") }}</NuxtLink>
      </div>

      <div v-if="error" class="auth-form__error" role="alert">{{ error }}</div>

      <button
        type="submit"
        class="auth-form__submit"
        :disabled="pending || pendingGoogle"
      >
        <span v-if="!pending">{{ tx("auth.submit.login") }}</span>
        <span v-else class="auth-form__wait">
          <span class="auth-form__spinner" aria-hidden="true" />
          {{ tx("auth.wait") }}
        </span>
      </button>
    </form>

    <div class="auth-form__divider">
      <span>{{ tx("auth.or") }}</span>
    </div>

    <button
      type="button"
      class="auth-form__google"
      :disabled="pending || pendingGoogle"
      @click="onGoogle"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.8 0 3 .7 3.7 1.4l2.5-2.4C16.8 3.7 14.6 2.7 12 2.7 6.9 2.7 2.7 6.9 2.7 12S6.9 21.3 12 21.3c5.2 0 8.6-3.6 8.6-8.7 0-.6-.1-1-.1-1.4H12z"
        />
        <path
          fill="#34A853"
          d="M3.9 7.4l3 2.2C7.8 7.4 9.7 6.2 12 6.2c1.8 0 3 .7 3.7 1.4l2.5-2.4C16.8 3.7 14.6 2.7 12 2.7 8.4 2.7 5.3 4.7 3.9 7.4z"
        />
        <path
          fill="#4A90E2"
          d="M12 21.3c2.5 0 4.6-.8 6.1-2.2l-2.9-2.3c-.8.6-1.9 1-3.2 1-3.5 0-6.4-2.3-7.4-5.5l-3 2.3C3.3 18.8 7.3 21.3 12 21.3z"
        />
        <path
          fill="#FBBC05"
          d="M4.6 14.3c-.2-.6-.4-1.3-.4-2s.1-1.4.4-2l-3-2.3C1.3 9.3 1 10.6 1 12s.3 2.7.9 3.9l2.7-1.6z"
        />
      </svg>
      <span v-if="!pendingGoogle">{{ tx("auth.google") }}</span>
      <span v-else>{{ tx("auth.wait") }}</span>
    </button>

    <p class="auth-form__footer">
      {{ tx("auth.noAccount") }}
      <NuxtLink to="/auth/register">{{ tx("auth.goRegister") }}</NuxtLink>
    </p>
  </div>
</template>

<style>
@import url("~/assets/css/auth-form.css");
</style>
