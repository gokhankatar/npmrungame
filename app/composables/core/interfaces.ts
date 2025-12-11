export interface Admin_User {
  createdAt: string;
  creationTime: string;
  lastLoginAt: string;
  lastSignInTime: string;
}

export interface StoreNpmRunGame {
  isAdmin: boolean;
  theme?: "dark" | "light";
  active_game_platform: string;
  active_detailed_game: {
    id: number | string | null;
    name: string | null;
  };
  prevPage: string | null;
  currentPage: string | number | null;
  nextPage: string | null;
  active_games_endpoint: string | null;
  active_blog_id: string | null;
  hasAnySuccessfulLogin: boolean;
  active_admin_list_item:
    | "dashboard"
    | "completed_games"
    | "to_play_games"
    | "blog";
  admin_user: Admin_User | null;
  active_game_genre: {
    title:
      | "Aksiyon"
      | "Strateji"
      | "Nişancı"
      | "Indie"
      | "Rol Yapma"
      | "Macera"
      | "Korku"
      | "Souls-Like"
      | null;
    slug:
      | "action"
      | "strategy"
      | "adventure"
      | "shooter"
      | "indie"
      | "rpg"
      | "horror"
      | "souls-like"
      | null;
  };
}

export interface NavbarList {
  title: string;
  path: string;
  icon: string;
}

export interface Game_Category {
  name: "PC" | "PS5" | "Xbox" | "Nintendo Switch" | "En Yüksek Puanlı";
  slug: "pc" | "ps5" | "xbox" | "nintendo" | "star";
  icon: string;
}

export interface Feature_Card {
  title: string;
  icon: string;
  description: string;
}

export interface AdminListItem {
  title: string;
  slug:
    | "dashboard"
    | "completed_games"
    | "to_play_games"
    | "blog"
    | "messages"
    | "current_games"
    | "recommended_games";
  icon: string;
}

export interface Youtube_Channel_Stats {
  hiddenSubscriberCount: boolean | null;
  subscriberCount: string | number | null;
  videoCount: string | number | null;
  viewCount: string | number | null;
}

export interface Add_Blog_Form_Model {
  file: File | null;
  previewUrl: string | null;
  title: string;
  content: string;
  keywords: string[] | any;
}

export type Game_Genre_Name =
  | "Aksiyon"
  | "Strateji"
  | "Nişancı"
  | "Indie"
  | "Rol Yapma"
  | "Macera"
  | "Korku"
  | "Souls-Like";

export type Game_Genre_Slug =
  | "action"
  | "strategy"
  | "role-playing-games-rpg"
  | "adventure"
  | "shooter"
  | "indie"
  | "horror"
  | "souls-like";

export interface Game_Genre {
  name: Game_Genre_Name;
  slug: Game_Genre_Slug;
  background_img: string;
  type: "genre" | "tag";
}

interface Footer_SubItem {
  subtitle: string;
  path: string;
}

export interface Footer_Social_Links {
  title: string;
  icon: string;
  link: string;
}

export interface BlogBlock {
  type: "title" | "divider" | "paragraph";
  content?: string;
  key: string;
}

export interface Footer_Link {
  title: string;
  items: Footer_SubItem[];
}
