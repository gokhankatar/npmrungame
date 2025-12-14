import { overlay } from "three/tsl";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  modules: [
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "nuxt-lodash",
    "vuetify-nuxt-module",
    "nuxt-swiper",
  ],
  runtimeConfig: {
    rawg_api_key: process.env.API_KEY,
    youtube_api_key: process.env.YOUTUBE_API_KEY,
    youtube_channel_id: process.env.YOUTUBE_CHANNEL_ID,
    adminPassw: process.env.ADMIN_PASSWORD_KEY,
    mail: process.env.MAIL,
    mail_password: process.env.MAIL_PASSWORD,
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    },
  },
  app: {
    head: {
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap",
        },
      ],
    },
  },
  lodash: {
    prefix: "_",
    prefixSkip: ["string"],
    upperAfterPrefix: false,
    exclude: ["map"],
    alias: [
      ["camelCase", "stringToCamelCase"],
      ["kebabCase", "stringToKebab"],
      ["isDate", "isLodashDate"],
    ],
  },
  css: ["~/assets/css/main.css"],
  devtools: { enabled: false },
  devServer: {
    host: "0.0.0.0",
    port: 4000,
  },
});
