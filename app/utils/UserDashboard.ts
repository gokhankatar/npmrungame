export interface UserDashboardItem {
  title: string;
  slug: string;
  icon: string;
}

export const userDashboardItems: UserDashboardItem[] = [
  {
    title: "Bitirdiğim Oyunlar",
    slug: "completed_games",
    icon: "mdi-check-circle-outline",
  },
  {
    title: "Radarımdaki Oyunlar",
    slug: "upcoming_games",
    icon: "mdi-radar",
  },
  {
    title: "Bu yıl bitirdiklerim",
    slug: "target_2026_games",
    icon: "mdi-calendar-check",
  },
];
