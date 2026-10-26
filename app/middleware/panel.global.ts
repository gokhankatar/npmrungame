/**
 * Panel-first giriş:
 * - `/` → girişliyse dashboard, değilse login
 * - `/dashboard/**` korumalı
 * - auth sayfaları guest middleware ile yönetilir
 */
const AUTH_ONLY_PREFIXES = ["/dashboard"];

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  const needsAuth = AUTH_ONLY_PREFIXES.some(
    (p) => to.path === p || to.path.startsWith(`${p}/`)
  );

  if (to.path === "/" || to.path === "") {
    const { waitForAuth } = useAuthReady();
    const uid = await waitForAuth();
    return navigateTo(uid ? "/dashboard" : "/auth/login", { replace: true });
  }

  if (!needsAuth) return;

  const { waitForAuth } = useAuthReady();
  const uid = await waitForAuth();
  if (!uid) {
    return navigateTo("/auth/login");
  }
});
