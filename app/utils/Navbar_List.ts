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
        path: "/completed-games",
        icon: "mdi-trophy-outline",
    },
    {
        title: "Oyun Öner",
        path: "/recommend-games",
        icon: "mdi-microsoft-xbox-controller",
    },
    {
        title: "Oynayacaklarım",
        path: "/to-play-games",
        icon: "mdi-controller-classic-outline",
    },
    {
        title: "Blog",
        path: "/blogs",
        icon: "mdi-post",
    },
]
