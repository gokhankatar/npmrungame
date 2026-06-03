import { footer_social_links } from "~/utils/Footer_Links";
import { navbarListItems } from "~/utils/Navbar_List";
import { buildPageUrl, SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from "~/utils/siteSeo";

export type NavSchemaItem = {
  name: string;
  path: string;
};

/** Google sitelink adayları — navbar ile aynı ana bölümler */
export const MAIN_NAV_SCHEMA: NavSchemaItem[] = [
  { name: "Anasayfa", path: "/" },
  ...navbarListItems.map((item) => ({
    name: item.title,
    path: item.path,
  })),
  { name: "İletişim", path: "/contact" },
];

export const buildSiteSchemaGraph = () => {
  const sameAs = footer_social_links
    .map((s) => s.link)
    .filter((url) => url.startsWith("http"));

  const navigationItems = MAIN_NAV_SCHEMA.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: buildPageUrl(item.path),
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
        },
        sameAs,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description:
          "Türkçe 4K oyun kanalı: bitirdiğim oyunlar, radarımdaki çıkışlar, oyun önerileri, blog ve oyun keşfet.",
        inLanguage: "tr-TR",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/#main-navigation`,
        name: "npmrungame ana menü",
        description:
          "Site bölümleri: keşfet, bitirdiğim oyunlar, radar, blog ve iletişim.",
        itemListElement: navigationItems,
      },
    ],
  };
};
