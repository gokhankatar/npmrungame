/**
 * Auth sayfaları — zaten girişliyse panele at.
 */
export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return;

  const { waitForAuth } = useAuthReady();
  const uid = await waitForAuth();

  if (uid) {
    return navigateTo("/dashboard");
  }
});
