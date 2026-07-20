import type { AdminListItem } from "~/composables/core/interfaces";

export interface AdminNavSection {
  id: string;
  /** Bölüm başlığı; null = üst blok (YouTube ana menü gibi) */
  title: string | null;
  items: AdminListItem[];
}

export const adminNavSections: AdminNavSection[] = [
  {
    id: "overview",
    title: null,
    items: [
      {
        title: "Özet",
        slug: "dashboard",
        icon: "mdi-view-dashboard-outline",
      },
      {
        title: "Bildirimler",
        slug: "notifications",
        icon: "mdi-bell-outline",
      },
    ],
  },
  {
    id: "games",
    title: "Oyun koleksiyonları",
    items: [
      {
        title: "Şuan oynananlar",
        slug: "current_games",
        icon: "mdi-play-circle-outline",
      },
      {
        title: "Bitirdiğim oyunlar",
        slug: "completed_games",
        icon: "mdi-check-circle-outline",
      },
      {
        title: "Önerilen oyunlar",
        slug: "recommended_games",
        icon: "mdi-thumb-up-outline",
      },
      {
        title: "Radarımdaki oyunlar",
        slug: "upcoming_games",
        icon: "mdi-radar",
      },
    ],
  },
  {
    id: "personal",
    title: "Kişisel (sadece panel)",
    items: [
      {
        title: "Bir ara oynayacaklarım",
        slug: "to_play_games",
        icon: "mdi-playlist-play",
      },
    ],
  },
  {
    id: "content",
    title: "İçerik ve iletişim",
    items: [
      {
        title: "Blog",
        slug: "blog",
        icon: "mdi-post-outline",
      },
      {
        title: "Kayıtlar ve mesajlar",
        slug: "messages",
        icon: "mdi-email-outline",
      },
    ],
  },
];

/** Yatay mobil menü — tüm öğeler düz liste */
export const adminListItems: AdminListItem[] = adminNavSections.flatMap(
  (section) => section.items
);

export const adminNavFooterItems: AdminListItem[] = [
  {
    title: "Ayarlar",
    slug: "settings",
    icon: "mdi-cog-outline",
  },
];
