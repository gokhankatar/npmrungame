import type { AdminListItem } from "~/composables/core/interfaces";

export const adminListItems: AdminListItem[] = [
  {
    title: "Özet",
    slug: "dashboard",
    icon: "mdi-view-dashboard-outline",
  },
  {
    title: "Bildirimler",
    slug: "notifications",
    icon: "mdi-bell",
  },
   {
    title: "Kayıtlar ve Mesajlar",
    slug: "messages",
    icon: "mdi-email-outline",
  },
  {
    title: "Şuan Oynananlar",
    slug: "current_games",
    icon: "mdi-progress-clock",
  },
  {
    title: "Bitirdiğim Oyunlar",
    slug: "completed_games",
    icon: "mdi-check-circle-outline",
  },
  {
    title: "Oynayacaklarım",
    slug: "to_play_games",
    icon: "mdi-gamepad-variant-outline",
  },
  {
    title: "Önerilen Oyunlar",
    slug: "recommended_games",
    icon: "mdi-thumb-up",
  },
  {
    title: "Blog",
    slug: "blog",
    icon: "mdi-post-outline",
  },
];
