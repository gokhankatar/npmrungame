<script setup lang="ts">
import { signOut } from "firebase/auth";
import store from "~/store/store";
import { useAppLocale } from "~/composables/useAppLocale";
import { useUserProfile } from "~/composables/useUserProfile";
import PanelUserAvatar from "~/components/panel/PanelUserAvatar.vue";

const { tx } = useAppLocale();
const { $auth } = useNuxtApp();
const _store = store();
const { displayName, avatarSrc } = useUserProfile();

const open = ref(false);
const loggingOut = ref(false);
const root = ref<HTMLElement | null>(null);

const email = computed(() => _store.user?.email || "");

function onDocumentClick(e: MouseEvent) {
  if (!root.value?.contains(e.target as Node)) open.value = false;
}

onMounted(() => document.addEventListener("click", onDocumentClick));
onUnmounted(() => document.removeEventListener("click", onDocumentClick));

async function logout() {
  if (loggingOut.value) return;
  loggingOut.value = true;
  open.value = false;
  try {
    await signOut($auth);
    _store.clearUser();
    await navigateTo("/auth/login");
  } finally {
    loggingOut.value = false;
  }
}

function goAccount() {
  open.value = false;
  navigateTo("/dashboard/account");
}
</script>

<template>
  <div ref="root" class="ppm">
    <button
      type="button"
      class="ppm__trigger"
      :aria-expanded="open"
      :aria-label="tx('panel.profile.menu')"
      @click="open = !open"
    >
      <PanelUserAvatar :src="avatarSrc" :name="displayName" :size="36" />
      <span class="ppm__trigger-meta">
        <strong>{{ displayName }}</strong>
        <small v-if="email">{{ email }}</small>
      </span>
      <v-icon
        icon="mdi-chevron-down"
        size="18"
        class="ppm__chevron"
        :class="{ 'ppm__chevron--open': open }"
      />
    </button>

    <Transition name="ppm-pop">
      <div v-if="open" class="ppm__menu" role="menu">
        <div class="ppm__head">
          <PanelUserAvatar :src="avatarSrc" :name="displayName" :size="44" />
          <div class="ppm__head-text">
            <strong>{{ displayName }}</strong>
            <small v-if="email">{{ email }}</small>
          </div>
        </div>

        <div class="ppm__divider" />

        <button type="button" class="ppm__item" role="menuitem" @click="goAccount">
          <v-icon icon="mdi-account-cog-outline" size="18" />
          <span>{{ tx("panel.profile.account") }}</span>
        </button>

        <button
          type="button"
          class="ppm__item ppm__item--danger"
          role="menuitem"
          :disabled="loggingOut"
          @click="logout"
        >
          <v-icon icon="mdi-logout" size="18" />
          <span>{{ tx("auth.logout") }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.ppm {
  position: relative;
}

.ppm__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  max-width: 16rem;
  padding: 0.25rem 0.45rem 0.25rem 0.25rem;
  border: 1px solid var(--panel-border, rgb(255 255 255 / 0.1));
  border-radius: 999px;
  background: rgb(255 255 255 / 0.03);
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.ppm__trigger:hover {
  background: rgb(105 240 174 / 0.08);
  border-color: rgb(105 240 174 / 0.28);
}

.ppm__trigger-meta {
  display: none;
  min-width: 0;
  text-align: left;
}

.ppm__trigger-meta strong {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ppm__trigger-meta small {
  display: block;
  margin-top: 0.05rem;
  font-size: 0.68rem;
  color: var(--panel-muted, #94a3b8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ppm__chevron {
  display: none;
  color: var(--panel-muted, #94a3b8);
  transition: transform 0.15s ease;
}

.ppm__chevron--open {
  transform: rotate(180deg);
}

@media (min-width: 720px) {
  .ppm__trigger-meta,
  .ppm__chevron {
    display: block;
  }

  .ppm__chevron {
    display: inline-flex;
  }
}

.ppm__menu {
  position: absolute;
  top: calc(100% + 0.45rem);
  right: 0;
  z-index: 60;
  width: min(17.5rem, 86vw);
  padding: 0.55rem;
  border-radius: 1rem;
  border: 1px solid var(--panel-border, rgb(255 255 255 / 0.1));
  background: var(--panel-side, #0c1220);
  box-shadow: 0 18px 48px rgb(0 0 0 / 0.45);
}

:global(html:not(.dark)) .ppm__menu {
  background: #fff;
  box-shadow: 0 16px 40px rgb(15 23 42 / 0.12);
}

.ppm__head {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.45rem 0.4rem 0.65rem;
}

.ppm__head-text {
  min-width: 0;
}

.ppm__head-text strong {
  display: block;
  font-size: 0.88rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ppm__head-text small {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.72rem;
  color: var(--panel-muted, #94a3b8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ppm__divider {
  height: 1px;
  margin: 0.15rem 0.35rem 0.4rem;
  background: var(--panel-border, rgb(255 255 255 / 0.08));
}

.ppm__item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.65rem;
  padding: 0.7rem 0.75rem;
  border: none;
  border-radius: 0.7rem;
  background: transparent;
  color: var(--panel-text, #e8eef7);
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

.ppm__item:hover {
  background: rgb(105 240 174 / 0.1);
}

.ppm__item--danger {
  color: #f87171;
}

.ppm__item--danger:hover {
  background: rgb(248 113 113 / 0.1);
}

.ppm-pop-enter-active,
.ppm-pop-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.ppm-pop-enter-from,
.ppm-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
