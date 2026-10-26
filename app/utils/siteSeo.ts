export const SITE_URL = "https://www.npmrungame.com";
export const SITE_NAME = "npmrungame";

/** WhatsApp / Facebook için önerilen boyut (1200×630) */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT =
  "npmrungame — kişisel oyun paneli ve Top 9 listeleri";

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
  title: "npmrungame | Kişisel Oyun Paneli",
  description:
    "Oyunlarını takip et: oynadıkların, bitirdiklerin, radarın ve Top 9 listelerin — hepsi kişisel panelinde.",
  path: "/",
};

/** Statik sayfalar — panel-first */
export const STATIC_ROUTE_SEO: RouteSeoEntry[] = [
  DEFAULT_HOME,
  {
    path: "/top-10",
    title: "Top 9 Listeni Oluştur | npmrungame",
    description:
      "En sevdiğin 9 oyunu seç, 3×3 ekran görünümünde paylaş. Kendi Top 9 oyun listeni oluştur — npmrungame.",
  },
  {
    path: "/dashboard",
    title: "Panel | npmrungame",
    description: "Kişisel oyun paneli.",
    noIndex: true,
    robots: "noindex, nofollow",
  },
  {
    path: "/auth/login",
    title: "Giriş | npmrungame",
    description: "npmrungame paneline giriş yap.",
    noIndex: true,
    robots: "noindex, nofollow",
  },
  {
    path: "/auth/register",
    title: "Kayıt ol | npmrungame",
    description: "npmrungame paneline kayıt ol.",
    noIndex: true,
    robots: "noindex, nofollow",
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
  if (path.startsWith("/auth/") || path.startsWith("/dashboard")) {
    return { ...ADMIN_NOINDEX, title: "Panel | npmrungame", path };
  }

  const exact = STATIC_ROUTE_SEO.find((r) => r.path === path);
  if (exact) return exact;

  if (path.startsWith("/game-detail/")) {
    return {
      title: "Oyun detayı | npmrungame",
      description: "Oyun bilgileri, Metacritic, platformlar.",
      path,
      robots: "noindex, nofollow",
      noIndex: true,
    };
  }
  if (path.startsWith("/top-10/") && path !== "/top-10") {
    return {
      title: "Top 9 Listesi | npmrungame",
      description: "Topluluk Top 9 oyun listesi — npmrungame.",
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
