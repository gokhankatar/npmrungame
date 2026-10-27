<script setup lang="ts">
import type { Locale } from "~/utils/i18nMessages";
import type { ThemePreference } from "~/composables/useAppTheme";
import { useAppLocale } from "~/composables/useAppLocale";
import { useAppTheme } from "~/composables/useAppTheme";

withDefaults(
  defineProps<{
    /** dropdown: app bar · inline: panel sidebar */
    variant?: "dropdown" | "inline";
  }>(),
  { variant: "dropdown" }
);

const { locale, setLocale, tx } = useAppLocale();
const { theme, preference, setTheme } = useAppTheme();

const locales: { id: Locale; label: string }[] = [
  { id: "tr", label: "TR" },
  { id: "en", label: "EN" },
];

const themes: { id: ThemePreference; labelKey: string }[] = [
  { id: "light", labelKey: "prefs.theme.light" },
  { id: "dark", labelKey: "prefs.theme.dark" },
  { id: "system", labelKey: "prefs.theme.system" },
];

const themeIconPaths: Record<ThemePreference, string> = {
  light:
    "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z",
  dark: "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z",
  system:
    "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25",
};

const openMenu = ref<"lang" | "theme" | null>(null);
const root = ref<HTMLElement | null>(null);

const currentLocaleLabel = computed(
  () => locales.find((l) => l.id === locale.value)?.label ?? "TR"
);

const currentTheme = computed(
  () => themes.find((th) => th.id === preference.value) ?? themes[2]
);

function toggleMenu(menu: "lang" | "theme") {
  openMenu.value = openMenu.value === menu ? null : menu;
}

function pickLocale(id: Locale) {
  setLocale(id);
  openMenu.value = null;
}

function pickTheme(id: ThemePreference) {
  setTheme(id);
  openMenu.value = null;
}

function onDocumentClick(e: MouseEvent) {
  if (!root.value?.contains(e.target as Node)) openMenu.value = null;
}

onMounted(() => document.addEventListener("click", onDocumentClick));
onUnmounted(() => document.removeEventListener("click", onDocumentClick));
</script>

<template>
  <ClientOnly>
    <!-- Segmented (sidebar) -->
    <div
      v-if="variant === 'inline'"
      class="prefs-inline"
      :data-theme="theme"
      role="group"
      :aria-label="tx('prefs.language')"
    >
      <div class="prefs-inline__seg">
        <button
          v-for="item in locales"
          :key="item.id"
          type="button"
          class="prefs-inline__btn"
          :class="{ 'prefs-inline__btn--on': locale === item.id }"
          @click="setLocale(item.id)"
        >
          {{ item.label }}
        </button>
      </div>
      <div class="prefs-inline__divider" aria-hidden="true" />
      <div class="prefs-inline__seg">
        <button
          v-for="item in themes"
          :key="item.id"
          type="button"
          class="prefs-inline__icon"
          :class="{ 'prefs-inline__icon--on': preference === item.id }"
          :title="tx(item.labelKey)"
          :aria-label="tx(item.labelKey)"
          :aria-pressed="preference === item.id"
          @click="setTheme(item.id)"
        >
          <svg
            class="prefs-svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.8"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              :d="themeIconPaths[item.id]"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Dropdown (app bar) -->
    <div v-else ref="root" class="prefs-dd" :data-theme="theme">
      <div class="prefs-dd__wrap">
        <button
          type="button"
          class="prefs-dd__trigger"
          :aria-expanded="openMenu === 'lang'"
          :aria-label="tx('prefs.language')"
          :title="tx('prefs.language')"
          @click="toggleMenu('lang')"
        >
          <svg
            v-if="locale === 'tr'"
            class="prefs-flag"
            viewBox="0 0 20 15"
            aria-hidden="true"
          >
            <rect width="20" height="15" fill="#e30a17" />
            <circle cx="7" cy="7.5" r="3.75" fill="#fff" />
            <circle cx="7.9" cy="7.5" r="3" fill="#e30a17" />
            <path
              fill="#fff"
              d="M13.6 7.5l-1.9-.55.75 1.85-1.55-1.25-1.55 1.25.75-1.85-1.9.55 1.9.55-.75 1.85 1.55-1.25 1.55 1.25-.75-1.85z"
            />
          </svg>
          <svg
            v-else
            class="prefs-flag"
            viewBox="0 0 20 15"
            aria-hidden="true"
          >
            <rect width="20" height="15" fill="#012169" />
            <path d="M0 0l20 15M20 0L0 15" stroke="#fff" stroke-width="3" />
            <path d="M0 0l20 15M20 0L0 15" stroke="#c8102e" stroke-width="1.2" />
            <path d="M10 0v15M0 7.5h20" stroke="#fff" stroke-width="5" />
            <path d="M10 0v15M0 7.5h20" stroke="#c8102e" stroke-width="3" />
          </svg>
          <span>{{ currentLocaleLabel }}</span>
          <svg class="prefs-chevron" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fill-rule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <div v-if="openMenu === 'lang'" class="prefs-dd__menu" role="menu">
          <button
            v-for="item in locales"
            :key="item.id"
            type="button"
            role="menuitem"
            class="prefs-dd__item"
            :class="{ 'prefs-dd__item--on': locale === item.id }"
            @click="pickLocale(item.id)"
          >
            <span>{{ item.label }}</span>
            <svg
              v-if="locale === item.id"
              class="prefs-check"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="prefs-dd__wrap">
        <button
          type="button"
          class="prefs-dd__trigger"
          :aria-expanded="openMenu === 'theme'"
          :aria-label="tx('prefs.theme')"
          :title="tx('prefs.theme')"
          @click="toggleMenu('theme')"
        >
          <svg
            class="prefs-svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.8"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              :d="themeIconPaths[currentTheme.id]"
            />
          </svg>
          <span class="prefs-dd__label">{{ tx(currentTheme.labelKey) }}</span>
          <svg class="prefs-chevron" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fill-rule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <div v-if="openMenu === 'theme'" class="prefs-dd__menu prefs-dd__menu--theme" role="menu">
          <button
            v-for="item in themes"
            :key="item.id"
            type="button"
            role="menuitem"
            class="prefs-dd__item"
            :class="{ 'prefs-dd__item--on': preference === item.id }"
            @click="pickTheme(item.id)"
          >
            <svg
              class="prefs-svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.8"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                :d="themeIconPaths[item.id]"
              />
            </svg>
            <span>{{ tx(item.labelKey) }}</span>
            <svg
              v-if="preference === item.id"
              class="prefs-check"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <template #fallback>
      <div
        v-if="variant === 'inline'"
        class="prefs-skel prefs-skel--inline"
        aria-hidden="true"
      />
      <div v-else class="prefs-skel prefs-skel--dd" aria-hidden="true">
        <span /><span />
      </div>
    </template>
  </ClientOnly>
</template>

<style scoped>
.prefs-svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.prefs-flag {
  width: 1.25rem;
  height: 0.94rem;
  flex-shrink: 0;
  border-radius: 3px;
  box-shadow: 0 0 0 1px rgb(255 255 255 / 0.2);
}

.prefs-dd[data-theme="light"] .prefs-flag,
.prefs-inline[data-theme="light"] .prefs-flag {
  box-shadow: 0 0 0 1px rgb(15 23 42 / 0.12);
}

.prefs-chevron {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  opacity: 0.6;
}

.prefs-check {
  width: 1rem;
  height: 1rem;
  margin-left: auto;
  flex-shrink: 0;
}

/* —— Inline (sidebar) — dark-first —— */
.prefs-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  background: rgb(15 23 42 / 0.65);
}

.prefs-inline[data-theme="light"] {
  border-color: rgb(15 23 42 / 0.1);
  background: rgb(255 255 255 / 0.85);
}

.prefs-inline__seg {
  display: flex;
  align-items: center;
  padding: 0.15rem;
  border-radius: 0.5rem;
  background: #1e293b;
}

.prefs-inline[data-theme="light"] .prefs-inline__seg {
  background: #c2cad6;
}

.prefs-inline__divider {
  display: none;
  width: 1px;
  height: 1.25rem;
  background: #334155;
}

@media (min-width: 640px) {
  .prefs-inline__divider {
    display: block;
  }
}

.prefs-inline[data-theme="light"] .prefs-inline__divider {
  background: #e2e8f0;
}

.prefs-inline__btn,
.prefs-inline__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 0.4rem;
  background: transparent;
  color: #94a3b8;
  font: inherit;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.prefs-inline__btn {
  height: 1.75rem;
  padding: 0 0.5rem;
}

.prefs-inline__icon {
  width: 1.75rem;
  height: 1.75rem;
}

.prefs-inline__btn:hover,
.prefs-inline__icon:hover {
  color: #e2e8f0;
}

.prefs-inline[data-theme="light"] .prefs-inline__btn,
.prefs-inline[data-theme="light"] .prefs-inline__icon {
  color: #64748b;
}

.prefs-inline[data-theme="light"] .prefs-inline__btn:hover,
.prefs-inline[data-theme="light"] .prefs-inline__icon:hover {
  color: #0f172a;
}

.prefs-inline__btn--on,
.prefs-inline__icon--on {
  background: #334155;
  color: #69f0ae;
  box-shadow: none;
}

.prefs-inline[data-theme="light"] .prefs-inline__btn--on,
.prefs-inline[data-theme="light"] .prefs-inline__icon--on {
  background: #ced5e0;
  color: #047857;
  box-shadow: 0 1px 3px rgb(15 23 42 / 0.1);
}

/* —— Dropdown (app bar) — dark-first —— */
.prefs-dd {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.prefs-dd__wrap {
  position: relative;
}

.prefs-dd__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.25rem;
  padding: 0 0.75rem;
  border-radius: 0.55rem;
  border: 1px solid rgb(255 255 255 / 0.14);
  background: rgb(15 23 42 / 0.55);
  color: #e8eef7;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    color 0.15s ease;
}

.prefs-dd__trigger:hover {
  border-color: rgb(105 240 174 / 0.4);
  background: rgb(30 41 59 / 0.85);
  color: #69f0ae;
}

.prefs-dd[data-theme="light"] .prefs-dd__trigger {
  border-color: rgb(15 23 42 / 0.14);
  background: rgb(255 255 255 / 0.7);
  color: #0f172a;
}

.prefs-dd[data-theme="light"] .prefs-dd__trigger:hover {
  border-color: rgb(16 185 129 / 0.45);
  color: #047857;
}

.prefs-dd__label {
  display: none;
}

@media (min-width: 640px) {
  .prefs-dd__label {
    display: inline;
  }
}

.prefs-dd__menu {
  position: absolute;
  top: calc(100% + 0.45rem);
  right: 0;
  z-index: 70;
  min-width: 9rem;
  padding: 0.35rem;
  overflow: hidden;
  border-radius: 0.75rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  background: #0c1220;
  box-shadow: 0 18px 48px rgb(0 0 0 / 0.45);
}

.prefs-dd__menu--theme {
  min-width: 10.5rem;
}

.prefs-dd[data-theme="light"] .prefs-dd__menu {
  border-color: rgb(15 23 42 / 0.1);
  background: #ced5e0;
  box-shadow: 0 16px 40px rgb(15 23 42 / 0.14);
}

.prefs-dd__item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.65rem;
  border: none;
  border-radius: 0.55rem;
  background: transparent;
  color: #e2e8f0;
  font: inherit;
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

.prefs-dd__item:hover {
  background: rgb(255 255 255 / 0.06);
}

.prefs-dd[data-theme="light"] .prefs-dd__item {
  color: #334155;
}

.prefs-dd[data-theme="light"] .prefs-dd__item:hover {
  background: #c2cad6;
}

.prefs-dd__item--on {
  font-weight: 700;
  color: #69f0ae;
}

.prefs-dd[data-theme="light"] .prefs-dd__item--on {
  color: #047857;
}

.prefs-skel--inline {
  height: 2.5rem;
  width: 12rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(255 255 255 / 0.08);
  background: rgb(255 255 255 / 0.05);
}

.prefs-skel--dd {
  display: flex;
  gap: 0.5rem;
}

.prefs-skel--dd span {
  display: block;
  height: 2.25rem;
  width: 5.5rem;
  border-radius: 0.55rem;
  border: 1px solid rgb(255 255 255 / 0.14);
  background: rgb(0 0 0 / 0.2);
}
</style>
