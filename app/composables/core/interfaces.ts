export interface StoreNpmRunGame {
  theme?: "dark" | "light"
  active_game_platform: string
}

export interface NavbarList {
  title: string
  path: string
  icon: string
}

export interface Game_Category {
  name: "PC" | "PS5" | "Xbox" | "Nintendo Switch" | "En Yüksek Puanlı"
  slug: "pc" | "ps5" | "xbox" | "nintendo" | "star"
  icon: string;
}