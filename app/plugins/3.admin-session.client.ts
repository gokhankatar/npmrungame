import { onAuthStateChanged } from "firebase/auth";
import store from "~/store/store";
import type { Admin_User } from "~/composables/core/interfaces";

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return;

  const init = () => {
    const nuxtApp = useNuxtApp();
    const $auth = nuxtApp.$auth;

    if (!$auth) {
      setTimeout(init, 50);
      return;
    }

    const _store = store();
    const { load } = useAdminRememberMe();

    onAuthStateChanged($auth, (user) => {
      const saved = load();

      if (user && saved?.enabled && user.email === saved.email) {
        _store.login();
        _store.setAdminUserInfo(user.metadata as Admin_User);
        return;
      }

      if (!user && _store.isAdmin) {
        _store.logOut();
      }
    });
  };

  init();
});
