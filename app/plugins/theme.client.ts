import store from "~/store/store";
import { useAppTheme } from "~/composables/useAppTheme";
import { useAppLocale } from "~/composables/useAppLocale";

export default defineNuxtPlugin(() => {
  const { initTheme, theme } = useAppTheme();
  const { initLocale } = useAppLocale();

  initTheme();
  initLocale();

  // Vuetify: app.vue `<v-app :theme="theme">` ile senkron
  // Store: geriye dönük kullanım
  const _store = store();
  _store.setResolvedTheme(theme.value);

  watch(theme, (resolved) => {
    _store.setResolvedTheme(resolved);
  });
});
