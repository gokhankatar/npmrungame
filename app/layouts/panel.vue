<script setup lang="ts">
import { panelNavItems } from "~/utils/panelNav";
import { useAppLocale } from "~/composables/useAppLocale";
import { useUserProfile } from "~/composables/useUserProfile";
import PanelProfileMenu from "~/components/panel/PanelProfileMenu.vue";

const RAIL_STORAGE_KEY = "npmrungame.panel.rail";

const { tx } = useAppLocale();
const route = useRoute();
const { displayName } = useUserProfile();
const mobileOpen = ref(false);
const rail = ref(false);

function isActive(to: string) {
  if (to === "/dashboard") return route.path === "/dashboard";
  return route.path === to || route.path.startsWith(`${to}/`);
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
  <div class="panel-shell" :class="{ 'panel-shell--rail': rail }">
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
        <span>npmrungame</span>
      </NuxtLink>

      <div class="panel-appbar__spacer" />

      <CommonAppPreferences variant="dropdown" />
      <PanelProfileMenu />
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
            <strong>npmrungame</strong>
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

      <!-- ClientOnly: SSR/HMR panelNav drift (eski discover vs yeni top-10) hydrate mismatch'ini önler -->
      <ClientOnly>
        <nav class="panel-nav" :aria-label="tx('panel.navLabel')">
          <NuxtLink
            v-for="item in panelNavItems"
            :key="item.to"
            :to="item.to"
            class="panel-nav__link"
            :class="{ 'panel-nav__link--active': isActive(item.to) }"
            :title="tx(item.titleKey)"
          >
            <v-icon :icon="item.icon" size="20" />
            <span class="panel-nav__label">{{ tx(item.titleKey) }}</span>
          </NuxtLink>
        </nav>
        <template #fallback>
          <nav class="panel-nav" :aria-label="tx('panel.navLabel')" aria-hidden="true" />
        </template>
      </ClientOnly>

      <div class="panel-sidebar__foot">
        <div class="panel-sidebar__prefs">
          <CommonAppPreferences variant="inline" />
        </div>
      </div>
    </aside>

    <main class="panel-main">
      <slot />
    </main>
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
  --panel-side-w: 16.5rem;
  --panel-rail-w: 4.5rem;
  --panel-appbar-h: 3.65rem;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--panel-bg);
  color: var(--panel-text);
  font-family: "Montserrat", ui-sans-serif, system-ui, sans-serif;
}

:global(html:not(.dark)) .panel-shell {
  --panel-bg: #f1f5f9;
  --panel-side: #ffffff;
  --panel-border: rgb(15 23 42 / 0.08);
  --panel-text: #0f172a;
  --panel-muted: #64748b;
}

.panel-appbar {
  position: sticky;
  top: 0;
  z-index: 55;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  height: var(--panel-appbar-h);
  padding: 0 0.85rem;
  border-bottom: 1px solid var(--panel-border);
  background: rgb(12 18 32 / 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

:global(html:not(.dark)) .panel-appbar {
  background: rgb(255 255 255 / 0.92);
}

@media (min-width: 1024px) {
  .panel-appbar {
    padding-left: calc(var(--panel-side-w) + 1rem);
    padding-right: 1.25rem;
    transition: padding-left 0.2s ease;
  }

  .panel-shell--rail .panel-appbar {
    padding-left: calc(var(--panel-rail-w) + 0.85rem);
  }
}

.panel-appbar__spacer {
  flex: 1;
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

@media (min-width: 1024px) {
  .panel-brand--bar {
    display: none;
  }
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
  top: 0;
  left: 0;
  z-index: 50;
  display: flex;
  width: min(18rem, 88vw);
  height: 100vh;
  height: 100dvh;
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
    top: 0;
    transform: none;
    width: var(--panel-side-w);
    height: 100vh;
    height: 100dvh;
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

:global(html:not(.dark)) .panel-nav__link--active {
  color: #047857;
  background: rgb(16 185 129 / 0.12);
}

.panel-sidebar__foot {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.85rem;
  border-top: 1px solid var(--panel-border);
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
  .panel-sidebar--rail .panel-nav__label,
  .panel-sidebar--rail .panel-sidebar__prefs {
    display: none;
  }

  .panel-sidebar--rail .panel-nav {
    padding: 0.65rem 0.4rem;
  }

  .panel-sidebar--rail .panel-nav__link {
    justify-content: center;
    padding: 0.7rem 0.35rem;
    gap: 0;
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
