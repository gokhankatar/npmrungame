<script setup lang="ts">
import { deleteField, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import PanelUserAvatar from "~/components/panel/PanelUserAvatar.vue";
import { useAppLocale } from "~/composables/useAppLocale";
import { useUserProfile } from "~/composables/useUserProfile";
import store from "~/store/store";
import { startSteamOpenIdLink } from "~/utils/steamOpenId";

definePageMeta({
  layout: "panel",
  ssr: false,
  middleware: "auth",
});

const { $firestore } = useNuxtApp();
const _store = store();
const { tx } = useAppLocale();
const {
  user,
  displayName,
  avatarSrc,
  saving,
  uploading,
  error,
  patchProfile,
  uploadAvatar,
  removeAvatar,
} = useUserProfile();

useSeoMeta({
  title: () => `${tx("panel.account.title")} | npmrungame`,
  robots: "noindex, nofollow",
});

const firstName = ref("");
const lastName = ref("");
const phone = ref("");
const username = ref("");
const fileInput = ref<HTMLInputElement | null>(null);
const okMsg = ref("");
const localError = ref("");

const steamId = computed(() => String(user.value?.steamId || "").trim());
const steamLinked = computed(() => /^\d{17}$/.test(steamId.value));
const steamBusy = ref(false);
const steamSummary = ref<{
  personaname?: string;
  avatarfull?: string;
  gameextrainfo?: string;
  personastate?: number;
} | null>(null);
const steamSummaryError = ref("");

watch(
  user,
  (u) => {
    if (!u) return;
    firstName.value = u.firstName || "";
    lastName.value = u.lastName || "";
    phone.value = u.phone || "";
    username.value = u.username || "";
  },
  { immediate: true }
);

async function loadSteamSummary() {
  steamSummary.value = null;
  steamSummaryError.value = "";
  if (!steamLinked.value) return;

  try {
    const res = await $fetch<{
      success: boolean;
      data: typeof steamSummary.value;
    }>("/api/steam/player-summary", {
      query: { steamId: steamId.value },
    });
    steamSummary.value = res?.data || null;
  } catch {
    steamSummaryError.value = tx("panel.account.steam.loadFail");
  }
}

watch(
  steamId,
  () => {
    loadSteamSummary();
  },
  { immediate: true }
);

function connectSteam() {
  startSteamOpenIdLink("/auth/steam/callback");
}

async function disconnectSteam() {
  const uid = user.value?.uid;
  if (!uid || !$firestore || !steamLinked.value) return;

  steamBusy.value = true;
  localError.value = "";
  okMsg.value = "";
  try {
    await updateDoc(doc($firestore, "registered_users", uid), {
      steamId: deleteField(),
      updatedAt: serverTimestamp(),
    });
    const next = { ...user.value } as Record<string, unknown>;
    delete next.steamId;
    _store.setUser(next);
    steamSummary.value = null;
    okMsg.value = tx("panel.account.steam.unlinked");
  } catch (err: any) {
    localError.value = err?.message || tx("panel.account.steam.unlinkFail");
  } finally {
    steamBusy.value = false;
  }
}

function pickFile() {
  fileInput.value?.click();
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;

  localError.value = "";
  okMsg.value = "";
  try {
    await uploadAvatar(file);
    okMsg.value = tx("panel.account.avatarSaved");
  } catch (err: any) {
    localError.value = err?.message || tx("panel.account.avatarFail");
  }
}

async function onRemoveAvatar() {
  localError.value = "";
  okMsg.value = "";
  try {
    await removeAvatar();
    okMsg.value = tx("panel.account.avatarRemoved");
  } catch (err: any) {
    localError.value = err?.message || tx("panel.account.avatarFail");
  }
}

async function onSave() {
  localError.value = "";
  okMsg.value = "";
  try {
    await patchProfile({
      firstName: firstName.value,
      lastName: lastName.value,
      phone: phone.value,
      username: username.value,
    });
    okMsg.value = tx("panel.account.saved");
  } catch (err: any) {
    localError.value = err?.message || error.value || tx("panel.account.saveFail");
  }
}
</script>

<template>
  <div class="account-page">
    <header class="account-hero">
      <p class="account-hero__eyebrow">{{ tx("panel.account.eyebrow") }}</p>
      <h1 class="account-hero__title">{{ tx("panel.account.title") }}</h1>
      <p class="account-hero__sub">{{ tx("panel.account.subtitle") }}</p>
    </header>

    <section class="account-card account-card--avatar">
      <div class="account-avatar-row">
        <PanelUserAvatar :src="avatarSrc" :name="displayName" :size="88" />
        <div class="account-avatar-copy">
          <h2>{{ displayName }}</h2>
          <p>{{ user?.email }}</p>
          <div class="account-avatar-actions">
            <button
              type="button"
              class="account-btn account-btn--primary"
              :disabled="uploading"
              @click="pickFile"
            >
              {{ uploading ? tx("panel.account.uploading") : tx("panel.account.changeAvatar") }}
            </button>
            <button
              v-if="avatarSrc"
              type="button"
              class="account-btn account-btn--ghost"
              :disabled="uploading || saving"
              @click="onRemoveAvatar"
            >
              {{ tx("panel.account.removeAvatar") }}
            </button>
          </div>
          <p class="account-hint">{{ tx("panel.account.avatarHint") }}</p>
        </div>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        class="sr-only"
        @change="onFileChange"
      />
    </section>

    <section class="account-card">
      <h2 class="account-card__title">{{ tx("panel.account.personal") }}</h2>

      <form class="account-form" @submit.prevent="onSave">
        <div class="account-grid">
          <label class="account-field">
            <span>{{ tx("panel.account.firstName") }}</span>
            <input v-model="firstName" type="text" autocomplete="given-name" />
          </label>
          <label class="account-field">
            <span>{{ tx("panel.account.lastName") }}</span>
            <input v-model="lastName" type="text" autocomplete="family-name" />
          </label>
          <label class="account-field">
            <span>{{ tx("panel.account.username") }}</span>
            <input v-model="username" type="text" autocomplete="username" />
          </label>
          <label class="account-field">
            <span>{{ tx("panel.account.phone") }}</span>
            <input
              v-model="phone"
              type="tel"
              autocomplete="tel"
              placeholder="+90 5xx xxx xx xx"
            />
          </label>
          <label class="account-field account-field--full">
            <span>{{ tx("panel.account.email") }}</span>
            <input :value="user?.email || ''" type="email" disabled />
          </label>
        </div>

        <p v-if="okMsg" class="account-msg account-msg--ok">{{ okMsg }}</p>
        <p v-if="localError" class="account-msg account-msg--err">{{ localError }}</p>

        <div class="account-form__foot">
          <button type="submit" class="account-btn account-btn--primary" :disabled="saving">
            {{ saving ? tx("panel.account.saving") : tx("panel.account.save") }}
          </button>
        </div>
      </form>
    </section>

    <section class="account-card">
      <h2 class="account-card__title">{{ tx("panel.account.platforms") }}</h2>
      <p class="account-platforms__lead">{{ tx("panel.account.steam.desc") }}</p>

      <article class="account-platform">
        <div class="account-platform__head">
          <span class="account-platform__icon" aria-hidden="true">
            <v-icon icon="mdi-steam" size="22" />
          </span>
          <div class="account-platform__meta">
            <strong>{{ tx("panel.account.steam.title") }}</strong>
            <small
              :class="
                steamLinked
                  ? 'account-platform__badge account-platform__badge--on'
                  : 'account-platform__badge'
              "
            >
              {{
                steamLinked
                  ? tx("panel.account.steam.connected")
                  : tx("panel.account.steam.notConnected")
              }}
            </small>
          </div>
        </div>

        <template v-if="steamLinked">
          <dl class="account-platform__facts">
            <div>
              <dt>{{ tx("panel.account.steam.id") }}</dt>
              <dd>{{ steamId }}</dd>
            </div>
            <div v-if="steamSummary?.personaname">
              <dt>{{ tx("panel.account.steam.persona") }}</dt>
              <dd>{{ steamSummary.personaname }}</dd>
            </div>
            <div>
              <dt>{{ tx("panel.account.steam.playing") }}</dt>
              <dd>
                {{
                  steamSummary?.gameextrainfo ||
                  tx("panel.account.steam.offline")
                }}
              </dd>
            </div>
          </dl>
          <p v-if="steamSummaryError" class="account-msg account-msg--err">
            {{ steamSummaryError }}
          </p>
          <div class="account-platform__actions">
            <button
              type="button"
              class="account-btn account-btn--ghost"
              :disabled="steamBusy"
              @click="disconnectSteam"
            >
              {{ tx("panel.account.steam.disconnect") }}
            </button>
          </div>
        </template>

        <div v-else class="account-platform__actions">
          <button
            type="button"
            class="account-btn account-btn--steam"
            @click="connectSteam"
          >
            <v-icon icon="mdi-steam" size="18" />
            {{ tx("panel.account.steam.connect") }}
          </button>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.account-page {
  max-width: 44rem;
  margin: 0 auto;
  padding: 0.25rem 0.35rem 2rem;
  font-family: "Montserrat", ui-sans-serif, system-ui, sans-serif;
}

.account-hero {
  margin-bottom: 1.35rem;
}

.account-hero__eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #69f0ae;
}

.account-hero__title {
  margin: 0 0 0.4rem;
  font-size: clamp(1.45rem, 3vw, 1.85rem);
  font-weight: 800;
}

.account-hero__sub {
  margin: 0;
  font-size: 0.9rem;
  color: var(--panel-muted, #94a3b8);
  line-height: 1.5;
}

.account-card {
  margin-bottom: 1rem;
  padding: 1.25rem 1.3rem;
  border-radius: 1.1rem;
  border: 1px solid var(--panel-card-border, rgb(255 255 255 / 0.08));
  background: var(--panel-card, #0c1220);
  box-shadow: var(--panel-card-shadow, none);
}

.account-card__title {
  margin: 0 0 1rem;
  font-size: 0.95rem;
  font-weight: 800;
}

.account-avatar-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.1rem;
}

.account-avatar-copy {
  min-width: 0;
  flex: 1;
}

.account-avatar-copy h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
}

.account-avatar-copy > p {
  margin: 0.2rem 0 0.75rem;
  font-size: 0.82rem;
  color: #94a3b8;
}

.account-avatar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.account-hint {
  margin: 0.65rem 0 0;
  font-size: 0.72rem;
  color: #64748b;
}

.account-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.account-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.85rem;
}

@media (min-width: 640px) {
  .account-grid {
    grid-template-columns: 1fr 1fr;
  }

  .account-field--full {
    grid-column: 1 / -1;
  }
}

.account-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--panel-muted, #94a3b8);
}

.account-field input {
  border: 1px solid var(--panel-border, rgb(255 255 255 / 0.12));
  border-radius: 0.75rem;
  background: var(--panel-soft, rgb(0 0 0 / 0.25));
  color: var(--panel-text, #e8eef7);
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.7rem 0.85rem;
  outline: none;
}

.account-field input:focus {
  border-color: color-mix(in srgb, var(--panel-accent, #69f0ae) 45%, transparent);
  box-shadow: 0 0 0 3px var(--panel-icon-bg, rgb(105 240 174 / 0.12));
}

.account-field input:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.account-form__foot {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.25rem;
}

.account-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-height: 2.45rem;
  padding: 0.5rem 1.05rem;
  border-radius: 999px;
  border: 1px solid transparent;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background 0.15s ease;
}

.account-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.account-btn:disabled {
  opacity: 0.65;
  cursor: wait;
}

.account-btn--primary {
  background: var(--panel-accent, #69f0ae);
  color: var(--panel-accent-ink, #07140f);
}

.account-btn--ghost {
  background: transparent;
  border-color: var(--panel-border, rgb(255 255 255 / 0.14));
  color: var(--panel-muted, #cbd5e1);
}

.account-msg {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 600;
}

.account-msg--ok {
  color: var(--panel-accent, #69f0ae);
}

.account-msg--err {
  color: #f87171;
}

.account-platforms__lead {
  margin: -0.35rem 0 1rem;
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--panel-muted, #94a3b8);
}

.account-platform {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: 0.9rem;
  border: 1px solid var(--panel-border, rgb(255 255 255 / 0.1));
  background: var(--panel-soft, rgb(0 0 0 / 0.22));
}

.account-platform__head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.account-platform__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.7rem;
  background: rgb(27 40 56 / 0.9);
  color: #c7d5e0;
  border: 1px solid rgb(102 192 244 / 0.35);
}

.account-platform__meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.account-platform__meta strong {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--panel-text, #e8eef7);
}

.account-platform__badge {
  width: fit-content;
  font-size: 0.68rem;
  font-weight: 750;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #94a3b8;
}

.account-platform__badge--on {
  color: #69f0ae;
}

.account-platform__facts {
  margin: 0;
  display: grid;
  gap: 0.55rem;
}

.account-platform__facts div {
  display: grid;
  gap: 0.15rem;
}

.account-platform__facts dt {
  font-size: 0.68rem;
  font-weight: 750;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #64748b;
}

.account-platform__facts dd {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 650;
  color: var(--panel-text, #e8eef7);
  word-break: break-all;
}

.account-platform__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.account-btn--steam {
  background: #1b2838;
  border-color: rgb(102 192 244 / 0.45);
  color: #c7d5e0;
}

.account-btn--steam:hover:not(:disabled) {
  background: #2a475e;
  color: #fff;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
