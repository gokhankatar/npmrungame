import type { Footer_Link, Footer_Social_Links } from "~/composables/core/interfaces";

export const footer_links: Footer_Link[] = [
    {
        title: "Keşfet",
        items: [
            {
                subtitle: "Oyun Dünyası",
                path: "/discover"
            },
            {
                subtitle: "Bitirdiğim Oyunlar",
                path: "/completed-games"
            },
            {
                subtitle: "Oynayacaklarım",
                path: "/to-play-games"
            },
            {
                subtitle: "Bloglar",
                path: "/blogs"
            },
        ]
    },
    {
        title: "İletişim",
        items: [
            {
                subtitle: "Bana Ulaş",
                path: "/contact"
            },
            {
                subtitle: "Hakkımda",
                path: "/about"
            },
            {
                subtitle: "Oyun Öner",
                path: "/recommend-games"
            },
        ]
    },
]


export const footer_social_links: Footer_Social_Links[] = [
    {
        title: "Twitter",
        icon: "mdi-twitter",
        link: ""
    },
    {
        title: "Youtube",
        icon: "mdi-youtube",
        link: ""
    },
    {
        title: "Linkedin",
        icon: "mdi-linkedin",
        link: ""
    },
    {
        title: "Github",
        icon: "mdi-github",
        link: ""
    },
]