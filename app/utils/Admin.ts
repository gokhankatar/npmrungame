import type { AdminListItem } from "~/composables/core/interfaces";

export const adminListItems: AdminListItem[] = [
  {
    title: "Özet",
    slug: "dashboard",
    icon: "mdi-view-dashboard-outline",
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
    title: "Blog",
    slug: "blog",
    icon: "mdi-post-outline",
  },
];
