import store from "~/store/store";
import { useAppTheme } from "~/composables/useAppTheme";
import { useAppLocale } from "~/composables/useAppLocale";

export default defineNuxtPlugin((nuxtApp) => {
  const { initTheme, theme } = useAppTheme();
  const { initLocale } = useAppLocale();
  const _store = store();

  // Cookie SSR ile uyumlu; mount sonrası localStorage + html.dark senkron
  nuxtApp.hook("app:mounted", () => {
    initTheme();
    initLocale();
    _store.setResolvedTheme(theme.value);
  });

  // Vuetify: app.vue `<v-app :theme="theme">` ile bağlanır
  watch(theme, (resolved) => {
    _store.setResolvedTheme(resolved);
  });
});
