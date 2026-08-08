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
    twitch_client_id: process.env.TWITCH_CLIENT_ID,
    twitch_client_secret: process.env.TWITCH_CLIENT_SECRET,
    youtube_api_key: process.env.YOUTUBE_API_KEY,
    youtube_channel_id: process.env.YOUTUBE_CHANNEL_ID,
    adminPassw: process.env.ADMIN_PASSWORD_KEY,
    mail: process.env.MAIL,
    mail_password: process.env.MAIL_PASSWORD,
    steam_web_api_key: process.env.STEAM_WEB_API_KEY,
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      siteUrl: "https://www.npmrungame.com",
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: "tr" },
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      title: "npmrungame | 4K Oyun Kanalı & Oyun Kütüphanesi",
      meta: [
        {
          name: "description",
          content:
            "Türkçe 4K oyun kanalı: bitirdiğim oyunlar, radarımdaki çıkışlar, oyun önerileri, blog ve 800.000+ oyuna keşfet.",
        },
        { name: "robots", content: "index, follow" },
        { name: "theme-color", content: "#0D1421" },
        { property: "og:site_name", content: "npmrungame" },
        { property: "og:locale", content: "tr_TR" },
        { property: "og:type", content: "website" },
        {
          property: "og:title",
          content: "npmrungame | 4K Oyun Kanalı & Oyun Kütüphanesi",
        },
        {
          property: "og:description",
          content:
            "Türkçe 4K oyun kanalı: bitirdiğim oyunlar, radar, öneriler, blog ve keşfet.",
        },
        { property: "og:url", content: "https://www.npmrungame.com" },
        { property: "og:image", content: "https://www.npmrungame.com/og-image.png" },
        { property: "og:image:secure_url", content: "https://www.npmrungame.com/og-image.png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        {
          property: "og:image:alt",
          content: "npmrungame — 4K oyun kanalı ve oyun kütüphanesi",
        },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "npmrungame | 4K Oyun Kanalı & Oyun Kütüphanesi",
        },
        {
          name: "twitter:description",
          content:
            "Türkçe 4K oyun kanalı: bitirdiğim oyunlar, radar, öneriler, blog ve keşfet.",
        },
        { name: "twitter:image", content: "https://www.npmrungame.com/og-image.png" },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "canonical", href: "https://www.npmrungame.com" },
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
  vuetify: {
    vuetifyOptions: {
      theme: {
        defaultTheme: "dark",
        themes: {
          dark: {
            dark: true,
            colors: {
              background: "#0D1421",
              surface: "#0D1421",
              primary: "#69F0AE",
              secondary: "#D1D1D1",
              error: "#CF6679",
              info: "#2196F3",
              success: "#4CAF50",
              warning: "#FB8C00",
            },
          },
        },
      },
    },
  },
  devtools: { enabled: false },
  devServer: {
    host: "0.0.0.0",
    port: 4000,
    cors: { origin: "*" },
  },
  vite: {
    server: {
      allowedHosts: true,
      hmr: {
        clientPort: 4000,
      },
    },
  },
  routeRules: {
    "/profile/**": { ssr: false },
  },
});
