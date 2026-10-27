<script setup lang="ts">
import { panelNavItems } from "~/utils/panelNav";
import { useAppLocale } from "~/composables/useAppLocale";
import { useAppTheme } from "~/composables/useAppTheme";
import { useUserProfile } from "~/composables/useUserProfile";
import Scroll_To_Top from "~/components/common/Scroll_To_Top.vue";
import PanelProfileMenu from "~/components/panel/PanelProfileMenu.vue";
import store from "~/store/store";
import { isChannelOwner } from "~/utils/channelOwnerGames";

const RAIL_STORAGE_KEY = "npmrungame.panel.rail";

const { tx } = useAppLocale();
const { theme } = useAppTheme();
const route = useRoute();
const { displayName } = useUserProfile();
const _store = store();
const mobileOpen = ref(false);
const rail = ref(false);
/** Açık parent menü titleKey’leri */
const openGroups = ref<Record<string, boolean>>({});

const visibleNavItems = computed(() => {
  const owner = isChannelOwner(_store.user?.uid);
  return panelNavItems
    .filter((item) => !item.ownerOnly || owner)
    .map((item) => {
      if (!item.children?.length) return item;
      return {
        ...item,
        children: item.children.filter((c) => !c.ownerOnly || owner),
      };
    })
    .filter((item) => !item.children || item.children.length > 0);
});

function isActive(to?: string) {
  if (!to) return false;
  if (to === "/dashboard") return route.path === "/dashboard";
  return route.path === to || route.path.startsWith(`${to}/`);
}

function isGroupActive(item: (typeof panelNavItems)[number]) {
  return !!item.children?.some((c) => isActive(c.to));
}

function isGroupOpen(item: (typeof panelNavItems)[number]) {
  if (isGroupActive(item)) return true;
  return !!openGroups.value[item.titleKey];
}

function toggleGroup(item: (typeof panelNavItems)[number]) {
  if (rail.value) return;
  openGroups.value[item.titleKey] = !isGroupOpen(item);
}

function toggleRail() {
  rail.value = !rail.value;
  try {
    localStorage.setItem(RAIL_STORAGE_KEY, rail.value ? "1" : "0");
  } catch {
    /* ignore */
  }
}

onMounted(() => {
  try {
    rail.value = localStorage.getItem(RAIL_STORAGE_KEY) === "1";
  } catch {
    rail.value = false;
  }
});

watch(
  () => route.path,
  () => {
    mobileOpen.value = false;
  }
);
</script>

<template>
  <div
    class="panel-shell"
    :class="{ 'panel-shell--rail': rail }"
    :data-theme="theme"
  >
    <!-- App bar (desktop + mobile) -->
    <header class="panel-appbar">
      <button
        type="button"
        class="panel-icon-btn panel-icon-btn--menu"
        :aria-label="tx('panel.menu')"
        @click="mobileOpen = !mobileOpen"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      <NuxtLink to="/dashboard" class="panel-brand panel-brand--bar">
        <img src="/media/brand/channel-avatar.jpg" alt="" class="panel-brand__logo" />
        <span class="panel-brand__wordmark">
          <span class="panel-brand__title">{{ tx("panel.brand") }}</span>
          <span class="panel-brand__sub">{{ tx("panel.brand.sub") }}</span>
        </span>
      </NuxtLink>

      <div class="panel-appbar__spacer" aria-hidden="true" />

      <div class="panel-appbar__right">
        <CommonAppPreferences variant="dropdown" />
        <PanelProfileMenu />
      </div>
    </header>

    <div
      v-if="mobileOpen"
      class="panel-backdrop"
      aria-hidden="true"
      @click="mobileOpen = false"
    />

    <aside
      class="panel-sidebar"
      :class="{
        'panel-sidebar--open': mobileOpen,
        'panel-sidebar--rail': rail,
      }"
    >
      <div class="panel-sidebar__head">
        <NuxtLink
          to="/dashboard"
          class="panel-brand panel-brand--sidebar"
          :title="displayName"
        >
          <img src="/media/brand/channel-avatar.jpg" alt="" class="panel-brand__logo" />
          <div class="panel-brand__meta">
            <strong class="panel-brand__title">{{ tx("panel.brand") }}</strong>
            <small>{{ displayName }}</small>
          </div>
        </NuxtLink>

        <button
          type="button"
          class="panel-rail-btn"
          :aria-label="rail ? tx('panel.rail.expand') : tx('panel.rail.collapse')"
          :title="rail ? tx('panel.rail.expand') : tx('panel.rail.collapse')"
          @click="toggleRail"
        >
          <v-icon
            :icon="rail ? 'mdi-chevron-double-right' : 'mdi-chevron-double-left'"
            size="20"
          />
        </button>
      </div>

      <nav class="panel-nav" :aria-label="tx('panel.navLabel')">
        <template v-for="item in visibleNavItems" :key="item.titleKey">
          <div v-if="item.children?.length" class="panel-nav__group">
            <button
              type="button"
              class="panel-nav__link panel-nav__link--parent"
              :class="{
                'panel-nav__link--active': isGroupActive(item),
                'panel-nav__link--open': isGroupOpen(item),
              }"
              :title="tx(item.titleKey)"
              :aria-expanded="isGroupOpen(item)"
              @click="toggleGroup(item)"
            >
              <v-icon
                class="panel-nav__icon"
                :icon="item.icon || 'mdi-shield-account'"
                size="20"
              />
              <span class="panel-nav__label">{{ tx(item.titleKey) }}</span>
              <v-icon
                class="panel-nav__chevron"
                :icon="isGroupOpen(item) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                size="18"
              />
            </button>

            <div
              v-show="isGroupOpen(item) || rail"
              class="panel-nav__children"
              :class="{ 'panel-nav__children--rail': rail }"
            >
              <NuxtLink
                v-for="child in item.children"
                :key="child.to"
                :to="child.to!"
                class="panel-nav__link panel-nav__link--child"
                :class="{ 'panel-nav__link--active': isActive(child.to) }"
                :title="tx(child.titleKey)"
              >
                <v-icon :icon="child.icon" size="18" />
                <span class="panel-nav__label">{{ tx(child.titleKey) }}</span>
              </NuxtLink>
            </div>
          </div>

          <NuxtLink
            v-else-if="item.to"
            :to="item.to"
            class="panel-nav__link"
            :class="{ 'panel-nav__link--active': isActive(item.to) }"
            :title="tx(item.titleKey)"
          >
            <v-icon :icon="item.icon" size="20" />
            <span class="panel-nav__label">{{ tx(item.titleKey) }}</span>
          </NuxtLink>
        </template>
      </nav>

      <div class="panel-sidebar__foot">
        <p class="panel-sidebar__version" title="npmrungame v1.0.0">
          v1.0.0
        </p>
      </div>
    </aside>

    <main class="panel-main">
      <slot />
    </main>

    <Scroll_To_Top />
  </div>
</template>

<style scoped>
.panel-shell {
  --panel-bg: #070b14;
  --panel-side: #0c1220;
  --panel-border: rgb(255 255 255 / 0.08);
  --panel-text: #e8eef7;
  --panel-muted: #94a3b8;
  --panel-accent: #69f0ae;
  --panel-accent-ink: #07140f;
  --panel-card: #0c1220;
  --panel-card-border: rgb(255 255 255 / 0.1);
  --panel-card-shadow: 0 8px 28px rgb(0 0 0 / 0.22);
  --panel-soft: rgb(0 0 0 / 0.22);
  --panel-title-grad: linear-gradient(120deg, #ffffff 0%, #69f0ae 52%, #b9f6ca 100%);
  --panel-icon-bg: rgb(105 240 174 / 0.1);
  --panel-icon-border: rgb(105 240 174 / 0.28);
  --panel-side-w: 16.5rem;
  --panel-rail-w: 4.5rem;
  --panel-appbar-h: 3.65rem;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--panel-bg);
  color: var(--panel-text);
  font-family: "Montserrat", ui-sans-serif, system-ui, sans-serif;
  color-scheme: dark;
}

.panel-shell[data-theme="light"] {
  /* Keşif’te sorun yok — aynı orta slate palet */
  --panel-bg: #b9c1cf;
  --panel-side: #c8d0dc;
  --panel-border: rgb(15 23 42 / 0.14);
  --panel-text: #0f172a;
  --panel-muted: #334155;
  --panel-accent: #047857;
  --panel-accent-ink: #ffffff;
  --panel-card: #ced5e0;
  --panel-card-border: rgb(15 23 42 / 0.16);
  --panel-card-shadow: 0 1px 2px rgb(15 23 42 / 0.06);
  --panel-soft: #c2cad6;
  --panel-title-grad: linear-gradient(120deg, #0f172a 0%, #065f46 55%, #047857 100%);
  --panel-icon-bg: rgb(4 120 87 / 0.14);
  --panel-icon-border: rgb(4 120 87 / 0.38);
  color-scheme: light;
  background: var(--panel-bg);
}

.panel-appbar {
  position: sticky;
  top: 0;
  z-index: 55;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.65rem;
  height: var(--panel-appbar-h);
  padding: 0 1rem 0 0.85rem;
  border-bottom: 1px solid var(--panel-border);
  background: rgb(12 18 32 / 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.panel-shell[data-theme="light"] .panel-appbar {
  background: #c8d0dc;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.panel-appbar__spacer {
  flex: 1 1 auto;
  min-width: 0.5rem;
}

.panel-appbar__right {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex: 0 0 auto;
  margin-left: auto;
}

.panel-brand--bar {
  flex: 0 0 auto;
  margin: 0;
  justify-content: flex-start;
  order: 0;
}

.panel-icon-btn {
  display: inline-flex;
  width: 2.25rem;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--panel-border);
  border-radius: 0.65rem;
  background: transparent;
  color: var(--panel-text);
  cursor: pointer;
}

.panel-icon-btn svg {
  width: 1.15rem;
  height: 1.15rem;
}

@media (min-width: 1024px) {
  .panel-icon-btn--menu {
    display: none;
  }
}

.panel-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: inherit;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  min-width: 0;
}

.panel-brand__logo {
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 9999px;
  object-fit: cover;
  flex-shrink: 0;
}

.panel-brand__wordmark {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  min-width: 0;
  line-height: 1.1;
}

.panel-brand__title {
  background: var(
    --panel-title-grad,
    linear-gradient(120deg, #ffffff 0%, #69f0ae 52%, #b9f6ca 100%)
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.panel-brand--bar .panel-brand__title {
  font-size: clamp(1.05rem, 2vw, 1.28rem);
  letter-spacing: 0.04em;
}

.panel-brand__sub {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: lowercase;
  color: var(--panel-muted);
}

@media (max-width: 520px) {
  .panel-brand__sub {
    display: none;
  }
}

.panel-brand--sidebar {
  align-items: flex-start;
  flex: 1;
  margin-right: 0;
  min-width: 0;
}

.panel-brand__meta {
  min-width: 0;
}

.panel-brand--sidebar strong {
  display: block;
  font-size: 0.95rem;
}

.panel-brand--sidebar small {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--panel-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


.panel-backdrop {
  position: fixed;
  inset: 0;
  z-index: 45;
  background: rgb(0 0 0 / 0.45);
}

@media (min-width: 1024px) {
  .panel-backdrop {
    display: none;
  }
}

.panel-sidebar {
  position: fixed;
  top: var(--panel-appbar-h);
  left: 0;
  z-index: 50;
  display: flex;
  width: min(18rem, 88vw);
  height: calc(100vh - var(--panel-appbar-h));
  height: calc(100dvh - var(--panel-appbar-h));
  flex-direction: column;
  border-right: 1px solid var(--panel-border);
  background: var(--panel-side);
  transform: translateX(-105%);
  transition:
    transform 0.2s ease,
    width 0.2s ease;
}

.panel-sidebar--open {
  transform: translateX(0);
}

@media (min-width: 1024px) {
  .panel-sidebar {
    transform: none;
    width: var(--panel-side-w);
  }

  .panel-sidebar--rail {
    width: var(--panel-rail-w);
  }
}

.panel-sidebar__head {
  display: flex;
  align-items: flex-start;
  gap: 0.35rem;
  padding: 1.1rem 0.75rem 0.75rem;
  border-bottom: 1px solid var(--panel-border);
}

.panel-rail-btn {
  display: none;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  margin-top: 0.15rem;
  border: 1px solid var(--panel-border);
  border-radius: 0.55rem;
  background: transparent;
  color: var(--panel-muted);
  cursor: pointer;
}

.panel-rail-btn:hover {
  color: var(--panel-text);
  background: rgb(105 240 174 / 0.08);
}

@media (min-width: 1024px) {
  .panel-rail-btn {
    display: inline-flex;
  }
}

.panel-nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.85rem 0.65rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.panel-nav__link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.65rem 0.75rem;
  border-radius: 0.75rem;
  color: var(--panel-muted);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
  white-space: nowrap;
}

.panel-nav__link:hover {
  background: rgb(105 240 174 / 0.08);
  color: var(--panel-text);
}

.panel-nav__link--active {
  background: rgb(105 240 174 / 0.14);
  color: var(--panel-accent);
}

.panel-nav__link--parent {
  width: 100%;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: inherit;
}

.panel-nav__icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
}

.panel-nav__chevron {
  margin-left: auto;
  opacity: 0.7;
  flex-shrink: 0;
}

.panel-nav__group {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.panel-nav__children {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.15rem 0 0.25rem 0.55rem;
  margin-left: 0.55rem;
  border-left: 1px solid rgb(105 240 174 / 0.22);
}

.panel-nav__link--child {
  padding: 0.55rem 0.7rem;
  font-size: 0.82rem;
}

.panel-shell[data-theme="light"] .panel-nav__link--active {
  color: #065f46;
  background: rgb(4 120 87 / 0.14);
  font-weight: 800;
}

.panel-shell[data-theme="light"] .panel-brand__title {
  /* clip + light green = kayboluyor; solid koyu başlık */
  background: none;
  -webkit-background-clip: unset;
  background-clip: unset;
  -webkit-text-fill-color: #065f46;
  color: #065f46;
}

.panel-sidebar__foot {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
  padding: 0.85rem 1rem;
  border-top: 1px solid var(--panel-border);
}

.panel-sidebar__version {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: lowercase;
  color: var(--panel-muted);
  opacity: 0.85;
  user-select: none;
}

.panel-main {
  min-height: calc(100vh - var(--panel-appbar-h));
  min-height: calc(100dvh - var(--panel-appbar-h));
  padding: 0.75rem 0.5rem 2rem;
  transition: margin-left 0.2s ease;
}

@media (min-width: 1024px) {
  .panel-main {
    margin-left: var(--panel-side-w);
    padding: 1.25rem 1.5rem 2.5rem;
  }

  .panel-shell--rail .panel-main {
    margin-left: var(--panel-rail-w);
  }

  .panel-sidebar--rail .panel-sidebar__head {
    flex-direction: column;
    align-items: center;
    padding: 0.85rem 0.4rem;
  }

  .panel-sidebar--rail .panel-brand--sidebar {
    justify-content: center;
    align-items: center;
  }

  .panel-sidebar--rail .panel-brand__meta,
  .panel-sidebar--rail .panel-nav__label {
    display: none;
  }

  .panel-sidebar--rail .panel-sidebar__version {
    font-size: 0.62rem;
    letter-spacing: 0.04em;
    writing-mode: horizontal-tb;
  }

  .panel-sidebar--rail .panel-nav {
    padding: 0.65rem 0.4rem;
  }

  .panel-sidebar--rail .panel-nav__link {
    justify-content: center;
    padding: 0.7rem 0.35rem;
    gap: 0;
  }

  .panel-sidebar--rail .panel-nav__link--parent {
    display: none;
  }

  .panel-sidebar--rail .panel-nav__children {
    padding: 0;
    margin: 0;
    border: 0;
  }

  .panel-sidebar--rail .panel-nav__chevron {
    display: none;
  }

  .panel-sidebar--rail .panel-sidebar__foot {
    padding: 0.55rem 0.4rem;
    align-items: center;
  }

  .panel-sidebar--rail .panel-rail-btn {
    margin-top: 0.35rem;
  }
}
</style>
