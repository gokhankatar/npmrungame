import store from "~/store/store";
import { useAppTheme } from "~/composables/useAppTheme";
import { useAppLocale } from "~/composables/useAppLocale";

type VuetifyThemeApi = {
  theme?: {
    global?: { name?: { value: string } };
    change?: (name: string) => void;
  };
};

function syncVuetifyTheme(nuxtApp: { $vuetify?: VuetifyThemeApi }, mode: string) {
  const api = nuxtApp.$vuetify?.theme;
  if (!api || typeof api.change !== "function") return;
  if (api.global?.name?.value === mode) return;
  api.change(mode);
}

export default defineNuxtPlugin((nuxtApp) => {
  const { initTheme, theme } = useAppTheme();
  const { initLocale } = useAppLocale();
  const _store = store();

  /**
   * app:mounted’ta Vuetify theme.change/name= YAPMA.
   * Bu 1–2sn sonra light surface’i yeniden basıp “aşırı parlak katman” flaşı yapıyordu.
   * İlk tema: app.vue `<v-app :theme="theme">` + FOUC --app-bg.
   */
  nuxtApp.hook("app:mounted", () => {
    initTheme();
    initLocale();
    _store.setResolvedTheme(theme.value);
  });

  // Sadece kullanıcı temayı değişince Vuetify’yi güncelle
  watch(theme, (resolved, prev) => {
    _store.setResolvedTheme(resolved);
    if (resolved !== prev) {
      syncVuetifyTheme(nuxtApp as { $vuetify?: VuetifyThemeApi }, resolved);
    }
  });
});
