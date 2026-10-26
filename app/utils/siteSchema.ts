import { footer_social_links } from "~/utils/Footer_Links";
import {
  buildPageUrl,
  SITE_NAME,
  SITE_URL,
  DEFAULT_OG_IMAGE,
} from "~/utils/siteSeo";

export type NavSchemaItem = {
  name: string;
  path: string;
  description?: string;
};

/** Panel-first sitelink adayları */
export const MAIN_NAV_SCHEMA: NavSchemaItem[] = [
  {
    name: "Anasayfa",
    path: "/",
    description: "npmrungame kişisel oyun paneli.",
  },
  {
    name: "Panele Giriş",
    path: "/auth/login",
    description: "Kişisel oyun takip paneline giriş yap.",
  },
  {
    name: "Kayıt ol",
    path: "/auth/register",
    description: "Hesap oluştur ve kütüphaneni kur.",
  },
  {
    name: "Top 9",
    path: "/top-10",
    description: "En sevdiğin 9 oyunu seç ve paylaş.",
  },
];

export const buildSiteSchemaGraph = () => {
  const sameAs = footer_social_links
    .map((s) => s.link)
    .filter((url) => url.startsWith("http"));

  const itemListElements = MAIN_NAV_SCHEMA.map((item, index) => ({
    "@type": "SiteNavigationElement",
    position: index + 1,
    name: item.name,
    description: item.description,
    url: buildPageUrl(item.path),
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: ["npm run game", "npmrungame YouTube"],
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
        },
        image: DEFAULT_OG_IMAGE,
        description:
          "Kişisel oyun takip paneli: bitirilen oyunlar, radar, backlog ve Top 9 listeleri.",
        sameAs,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: "npm run game",
        description:
          "Kişisel oyun paneli: oynadıkların, bitirdiklerin, radarın ve Top 9 listelerin.",
        inLanguage: ["tr-TR", "en"],
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/#main-navigation`,
        name: "npmrungame ana menü",
        description: "Panel girişi, kayıt ve Top 9.",
        numberOfItems: MAIN_NAV_SCHEMA.length,
        itemListElement: itemListElements,
      },
      ...MAIN_NAV_SCHEMA.filter((i) => i.path !== "/auth/login").map(
        (item) => ({
          "@type": "WebPage",
          "@id": `${buildPageUrl(item.path)}#webpage`,
          url: buildPageUrl(item.path),
          name: item.name,
          description: item.description,
          isPartOf: { "@id": `${SITE_URL}/#website` },
          about: { "@id": `${SITE_URL}/#organization` },
        })
      ),
    ],
  };
};

export const buildBreadcrumbSchema = (
  crumbs: { name: string; path: string }[]
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    item: buildPageUrl(c.path),
  })),
});
