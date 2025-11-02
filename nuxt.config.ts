export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  modules: [
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "nuxt-lodash",
    "vuetify-nuxt-module",
  ],
  app: {
    head: {
      link: [
        {
          rel: "icon",
          type: 'image/x-icon',
          href: "/favicon.ico"
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap'
        }
      ]
    }
  },

  devtools: { enabled: false },
  devServer: {
    host: "0.0.0.0",
    port: 4000,
  },
});
