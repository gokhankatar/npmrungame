export type PanelNavItem = {
  title: string;
  /** i18n key for title */
  titleKey: string;
  icon: string;
  to?: string;
  /** Sadece kanal sahibi (owner UUID) görür */
  ownerOnly?: boolean;
  /** Parent menü — alt öğeler */
  children?: PanelNavItem[];
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
    title: "Bu yıl bitirdiklerim",
    titleKey: "panel.nav.target2026",
    to: "/dashboard/target-2026",
    icon: "mdi-calendar-check",
  },
  {
    title: "Top 9 listem",
    titleKey: "panel.nav.top9",
    to: "/top-10",
    icon: "mdi-numeric-9-plus-box-multiple-outline",
  },
  {
    title: "Admin",
    titleKey: "panel.nav.admin",
    icon: "mdi-shield-account",
    ownerOnly: true,
    children: [
      {
        title: "Oyuncular",
        titleKey: "panel.nav.players",
        to: "/dashboard/players",
        icon: "mdi-account-group-outline",
        ownerOnly: true,
      },
    ],
  },
];

/** Kart / sayım için düz liste (grupları açar) */
export function flattenPanelNav(items: PanelNavItem[]): PanelNavItem[] {
  return items.flatMap((item) =>
    item.children?.length ? item.children : [item]
  );
}
