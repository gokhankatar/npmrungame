import tailwindcss from "@tailwindcss/vite";

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
      title: "npmrungame | 4K Oyun Kanalı & Kişisel Oyun Paneli",
      meta: [
        {
          name: "description",
          content:
            "Türkçe 4K oyun kanalı ve kişisel oyun paneli: bitirdiğim oyunlar, radar, Top 10, blog ve 800.000+ oyuna keşfet. Kayıt ol, kendi listenini kur.",
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
      script: [
        {
          // FOUC + cookie: SSR ile aynı temayı paylaş (hydration mismatch önler)
          // FOUC: html.dark + --app-bg hemen (Vuetify/Vue gelmeden soft light bg; 1sn parlama önler)
          innerHTML: `(function(){try{var k='npmrungame-theme',rk='npmrungame-theme-resolved';var p=localStorage.getItem(k)||'system';var d=p==='dark'||(p==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=d?'dark':'light';var bg=d?'#070b14':'#b9c1cf';var root=document.documentElement;root.classList.toggle('dark',d);root.style.colorScheme=r;root.style.backgroundColor=bg;root.style.setProperty('--app-bg',bg);document.cookie=k+'='+encodeURIComponent(p)+';path=/;max-age=31536000;samesite=lax';document.cookie=rk+'='+r+';path=/;max-age=31536000;samesite=lax';var l=localStorage.getItem('npmrungame-locale');if(l==='tr'||l==='en')root.lang=l;}catch(e){}})();`,
          tagPosition: "head",
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
  css: ["~/assets/css/tailwind.css", "~/assets/css/main.css"],
  vuetify: {
    vuetifyOptions: {
      theme: {
        defaultTheme: "dark",
        themes: {
          light: {
            dark: false,
            colors: {
              background: "#B9C1CF",
              surface: "#CED5E0",
              surfaceBright: "#CED5E0",
              surfaceLight: "#C2CAD6",
              primary: "#059669",
              secondary: "#64748B",
              error: "#DC2626",
              info: "#2563EB",
              success: "#16A34A",
              warning: "#D97706",
            },
          },
          dark: {
            dark: true,
            colors: {
              background: "#070B14",
              surface: "#0C1220",
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
    plugins: [tailwindcss()],
    server: {
      allowedHosts: true,
      // Aynı port üzerinden HMR — ayrı 24678 çakışmasını önler
      hmr: {
        protocol: "ws",
        host: "localhost",
        port: 4000,
        clientPort: 4000,
      },
    },
  },
  routeRules: {
    // Panel layout auth-gated
    "/dashboard/**": { ssr: false },
    "/top-10": { ssr: false },
    "/top-10/**": { ssr: false },
    // Eski marketing URL'leri → panel
    "/about": { redirect: "/dashboard" },
    "/blogs": { redirect: "/dashboard" },
    "/blogs/**": { redirect: "/dashboard" },
    "/contact": { redirect: "/dashboard" },
    "/recommend-games": { redirect: "/dashboard" },
    "/completed-games": { redirect: "/dashboard/completed" },
    "/radarimdaki-oyunlar": { redirect: "/dashboard/radar" },
    "/to-play-games": { redirect: "/dashboard/to-play" },
    "/cikacak-oyunlar": { redirect: "/dashboard/radar" },
    "/discover": { redirect: "/dashboard" },
    "/discover/**": { redirect: "/dashboard" },
    "/profile/**": { redirect: "/dashboard/account" },
    "/dashboard/top9": { redirect: "/top-10" },
  },
});


