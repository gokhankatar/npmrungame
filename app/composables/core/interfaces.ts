export interface Admin_User {
  createdAt: string;
  creationTime: string;
  lastLoginAt: string;
  lastSignInTime: string;
}

export type AdminListItemSlug =
  | "logout"
  | "home"
  | "dashboard"
  | "completed_games"
  | "to_play_games"
  | "blog"
  | "messages"
  | "current_games"
  | "recommended_games"
  | "notifications"
  | "settings"
  | string;

export interface Blog_Toast_Admin {
  blogToastBar: boolean;
  status: "success" | "warning" | "deleted" | "updated";
  msg: string;
}

export interface FeedbackMessageOnContact {
  show: boolean;
  display_name: string;
  type: "error" | "success";
  message: string;
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
  slug: AdminListItemSlug;
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

export type Game_Filter_Type = "genre" | "tag";

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

export type Existed_Game_Collection = "completed_games" | "current_games" | "to_play_games" | "recommended_games" | null

export interface Active_Game_Genre {
  title: Game_Genre_Name | null;
  slug: Game_Genre_Slug | null;
  type: Game_Filter_Type | null;
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
  currentPage: number | null;
  nextPage: string | null;
  isSeenFeatureNewsToast: boolean;

  active_games_endpoint: string | null;
  active_blog_id: string | null;

  hasAnySuccessfulLogin: boolean;

  active_admin_list_item: AdminListItemSlug;
  admin_user: Admin_User | null;

  // 🔥 ARTIK INLINE TYPE YOK
  active_game_genre: Active_Game_Genre | null;
}
