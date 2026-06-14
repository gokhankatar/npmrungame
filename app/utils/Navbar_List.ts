import type { NavbarList } from "~/composables/core/interfaces";

export const navbarListItems: NavbarList[] = [
    {
        title: "Ben Kimim",
        path: "/about",
        icon: "mdi-account-circle-outline",
    },
    {
        title: "Keşfet",
        path: "/discover",
        icon: "mdi-compass-outline",
    },
    {
        title: "Bitirdiğim Oyunlar",
        shortTitle: "Bitirdiklerim",
        path: "/completed-games",
        icon: "mdi-trophy-outline",
    },
    {
        title: "Oyun Öner",
        shortTitle: "Öner",
        path: "/recommend-games",
        icon: "mdi-hand-heart-outline",
    },
    {
        title: "Top 10",
        shortTitle: "Top 10",
        path: "/top-10",
        icon: "mdi-numeric-10-box-multiple-outline",
    },
    {
        title: "Radarımdaki Oyunlar",
        shortTitle: "Radar",
        path: "/radarimdaki-oyunlar",
        icon: "mdi-radar",
    },
    {
        title: "Blog",
        path: "/blogs",
        icon: "mdi-post",
    },
]
