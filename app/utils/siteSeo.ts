export const SITE_URL = "https://www.npmrungame.com";
export const SITE_NAME = "npmrungame";

/** WhatsApp / Facebook için önerilen boyut (1200×630) */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT =
  "npmrungame — 4K oyun kanalı, bitirdiğim oyunlar, radar ve keşfet";

export type SiteSeoOptions = {
  title: string;
  description: string;
  /** Tam canonical / og:url; verilmezse path ile birleştirilir */
  path?: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  robots?: string;
  noIndex?: boolean;
};

export type RouteSeoEntry = SiteSeoOptions & { path: string };

const DEFAULT_HOME: SiteSeoOptions = {
  title: "npmrungame | 4K Oyun Kanalı & Oyun Kütüphanesi",
  description:
    "Türkçe 4K oyun kanalı: bitirdiğim oyunlar, radarımdaki çıkışlar, oyun önerileri, blog ve 800.000+ oyuna keşfet. YouTube npmrungame.",
  path: "/",
};

/** Statik sayfalar — Türkçe SEO */
export const STATIC_ROUTE_SEO: RouteSeoEntry[] = [
  DEFAULT_HOME,
  {
    path: "/discover",
    title: "Keşfet | npmrungame",
    description:
      "RAWG üzerinden oyun ara, türe göre filtrele ve npmrungame kütüphanesine ekle. Türkçe oyun keşif sayfası.",
  },
  {
    path: "/completed-games",
    title: "Bitirdiğim Oyunlar | npmrungame",
    description:
      "Tamamladığım oyunların listesi: süre, Metacritic, tür ve tamamlanma tarihleri. Kişisel oyun arşivi.",
  },
  {
    path: "/radarimdaki-oyunlar",
    title: "Radarımdaki Oyunlar | npmrungame",
    description:
      "Çıkış tarihine göre takip ettiğim yaklaşan oyunlar. En yakın çıkışlar ve geri sayım.",
  },
  {
    path: "/recommend-games",
    title: "Oyun Öner | npmrungame",
    description:
      "Topluluktan oyun önerileri gönder ve önerilen oyunları incele. npmrungame oyun öneri sayfası.",
  },
  {
    path: "/top-10",
    title: "Top 10 Listeni Oluştur | npmrungame",
    description:
      "En sevdiğin 10 oyunu seç, sırala ve paylaş. Kendi Top 10 oyun listeni oluştur — npmrungame.",
  },
  {
    path: "/blogs",
    title: "Blog | npmrungame",
    description:
      "Oyun dünyasından haberler, incelemeler ve yazılar. npmrungame Türkçe oyun blogu.",
  },
  {
    path: "/about",
    title: "Ben Kimim? | npmrungame",
    description:
      "npmrungame kanalının arkasındaki ekip ve hikaye. 4K oyun içerikleri ve kişisel oyun kütüphanesi.",
  },
  {
    path: "/contact",
    title: "İletişim | npmrungame",
    description:
      "npmrungame ile iletişime geç: iş birliği, öneri ve geri bildirim için iletişim formu.",
  },
  {
    path: "/to-play-games",
    title: "Oynanacak Oyunlar | npmrungame",
    description: "Sırada bekleyen ve oynanmayı planladığım oyunlar listesi.",
  },
  {
    path: "/cikacak-oyunlar",
    title: "Çıkacak Oyunlar | npmrungame",
    description: "Yakında çıkacak oyunlar ve çıkış takvimi özeti.",
  },
];

const ADMIN_NOINDEX: SiteSeoOptions = {
  title: "Yönetim | npmrungame",
  description: "npmrungame yönetim paneli.",
  robots: "noindex, nofollow",
  noIndex: true,
};

export const resolveStaticRouteSeo = (path: string): SiteSeoOptions | null => {
  if (path.startsWith("/admin-login")) {
    return { ...ADMIN_NOINDEX, title: "Admin girişi | npmrungame", path };
  }
  if (path.startsWith("/admin")) {
    return { ...ADMIN_NOINDEX, path };
  }
  if (path.startsWith("/auth/") || path.startsWith("/profile/")) {
    return { ...ADMIN_NOINDEX, title: "Hesap | npmrungame", path };
  }

  const exact = STATIC_ROUTE_SEO.find((r) => r.path === path);
  if (exact) return exact;

  if (path.startsWith("/game-detail/")) {
    return {
      title: "Oyun detayı | npmrungame",
      description: "Oyun bilgileri, Metacritic, platformlar ve npmrungame kütüphanesi.",
      path,
    };
  }
  if (path.startsWith("/discover/") && path !== "/discover") {
    return {
      title: "Oyun detayı | Keşfet | npmrungame",
      description: "Keşfet üzerinden oyun detay sayfası.",
      path,
    };
  }
  if (path.startsWith("/blogs/") && path !== "/blogs") {
    return {
      title: "Blog yazısı | npmrungame",
      description: "npmrungame blog yazısı.",
      path,
      type: "article",
    };
  }
  if (path.startsWith("/top-10/") && path !== "/top-10") {
    return {
      title: "Top 10 Listesi | npmrungame",
      description: "Topluluk Top 10 oyun listesi — npmrungame.",
      path,
    };
  }

  return null;
};

export const buildPageUrl = (path = "/") => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return SITE_URL;
  return `${SITE_URL}${normalized}`;
};

/** Meta description için HTML’den düz metin */
export const stripHtmlForSeo = (html?: string, maxLen = 160) => {
  if (!html) return "";
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1)}…`;
};
