export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  modules: [
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "nuxt-lodash",
    "vuetify-nuxt-module",
  ],
  devtools: { enabled: false },
  devServer: {
    host: "0.0.0.0",
    port: 4000,
  },
});
