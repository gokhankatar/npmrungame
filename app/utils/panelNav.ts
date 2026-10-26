export type PanelNavItem = {
  title: string;
  to: string;
  icon: string;
  /** i18n key for title */
  titleKey: string;
};

export const panelNavItems: PanelNavItem[] = [
  {
    title: "Özet",
    titleKey: "panel.nav.home",
    to: "/dashboard",
    icon: "mdi-view-dashboard-outline",
  },
  {
    title: "Şu an oynadıklarım",
    titleKey: "panel.nav.playing",
    to: "/dashboard/playing",
    icon: "mdi-play-circle-outline",
  },
  {
    title: "Bitirdiğim oyunlar",
    titleKey: "panel.nav.completed",
    to: "/dashboard/completed",
    icon: "mdi-trophy-outline",
  },
  {
    title: "Radarımdaki oyunlar",
    titleKey: "panel.nav.radar",
    to: "/dashboard/radar",
    icon: "mdi-radar",
  },
  {
    title: "Bir ara oynayacaklarım",
    titleKey: "panel.nav.toPlay",
    to: "/dashboard/to-play",
    icon: "mdi-playlist-play",
  },
  {
    title: "2026 hedeflerim",
    titleKey: "panel.nav.target2026",
    to: "/dashboard/target-2026",
    icon: "mdi-flag-checkered",
  },
  {
    title: "Top 9 listem",
    titleKey: "panel.nav.top9",
    to: "/top-10",
    icon: "mdi-numeric-9-plus-box-multiple-outline",
  },
];
