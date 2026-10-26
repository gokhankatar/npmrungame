<script setup lang="ts">
import { useAppLocale } from "~/composables/useAppLocale";

definePageMeta({
  layout: "auth",
  middleware: "guest",
});

const { tx } = useAppLocale();
const route = useRoute();
const {
  completePasswordReset,
  verifyResetCode,
  pending,
  error,
} = useFirebaseAuth();

const oobCode = computed(() => {
  const raw = route.query.oobCode;
  return typeof raw === "string" ? raw : "";
});

const newPassword = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const localError = ref("");
const success = ref(false);
const checking = ref(true);
const codeValid = ref(false);

useSeoMeta({
  title: () => `${tx("auth.reset.title")} | npmrungame`,
  description: () => tx("auth.reset.subtitle"),
});

onMounted(async () => {
  if (!oobCode.value) {
    checking.value = false;
    localError.value = tx("auth.reset.invalidLink");
    return;
  }
  try {
    await verifyResetCode(oobCode.value);
    codeValid.value = true;
  } catch {
    localError.value = error.value || tx("auth.reset.invalidLink");
  } finally {
    checking.value = false;
  }
});

async function onSubmit() {
  localError.value = "";
  if (newPassword.value !== confirmPassword.value) {
    localError.value = tx("auth.reset.mismatch");
    return;
  }
  if (newPassword.value.length < 6) {
    localError.value = tx("auth.password.placeholder");
    return;
  }
  try {
    await completePasswordReset(oobCode.value, newPassword.value);
    success.value = true;
  } catch {
    localError.value = error.value;
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
      <h1 class="auth-form__title">{{ tx("auth.reset.title") }}</h1>
      <p class="auth-form__subtitle">{{ tx("auth.reset.subtitle") }}</p>
    </div>

    <div v-if="checking" class="auth-form__success" role="status">
      {{ tx("auth.wait") }}
    </div>

    <div v-else-if="success" class="auth-form__success" role="status">
      {{ tx("auth.reset.success") }}
    </div>

    <div
      v-else-if="!codeValid"
      class="auth-form__error"
      role="alert"
      style="margin-top: 2rem"
    >
      {{ localError || tx("auth.reset.invalidLink") }}
    </div>

    <form
      v-else
      class="auth-form__fields"
      @submit.prevent="onSubmit"
    >
      <div class="auth-form__field">
        <label for="new-password">{{ tx("auth.reset.newPassword") }}</label>
        <div class="auth-form__password">
          <input
            id="new-password"
            v-model="newPassword"
            :type="showPassword ? 'text' : 'password'"
            name="new-password"
            autocomplete="new-password"
            required
            minlength="6"
            :disabled="pending"
            :placeholder="tx('auth.password.placeholder')"
          />
          <button
            type="button"
            tabindex="-1"
            class="auth-form__eye"
            :disabled="pending"
            :aria-label="
              showPassword ? tx('auth.password.hide') : tx('auth.password.show')
            "
            :aria-pressed="showPassword"
            @click="showPassword = !showPassword"
          >
            <svg
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
          </button>
        </div>
      </div>

      <div class="auth-form__field">
        <label for="confirm-password">{{
          tx("auth.reset.confirmPassword")
        }}</label>
        <input
          id="confirm-password"
          v-model="confirmPassword"
          type="password"
          name="confirm-password"
          autocomplete="new-password"
          required
          minlength="6"
          :disabled="pending"
        />
      </div>

      <div
        v-if="localError || error"
        class="auth-form__error"
        role="alert"
      >
        {{ localError || error }}
      </div>

      <button type="submit" class="auth-form__submit" :disabled="pending">
        <span v-if="!pending">{{ tx("auth.reset.submit") }}</span>
        <span v-else class="auth-form__wait">
          <span class="auth-form__spinner" aria-hidden="true" />
          {{ tx("auth.wait") }}
        </span>
      </button>
    </form>

    <p class="auth-form__back">
      <NuxtLink v-if="success" to="/auth/login">{{
        tx("auth.goLogin")
      }}</NuxtLink>
      <NuxtLink v-else to="/auth/forgot-password">{{
        tx("auth.forgot.link")
      }}</NuxtLink>
      <template v-if="!success"> · </template>
      <NuxtLink v-if="!success" to="/auth/login">{{
        tx("auth.backToLogin")
      }}</NuxtLink>
    </p>
  </div>
</template>

<style>
@import url("~/assets/css/auth-form.css");
</style>
