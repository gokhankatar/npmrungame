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
  active_admin_list_item:
  | "dashboard"
  | "completed_games"
  | "to_play_games"
  | "blog";
  admin_user: Admin_User | null;
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

export interface AdminListItem {
  title: string;
  slug: "dashboard" | "completed_games" | "to_play_games" | "blog";
  icon: string;
}

export interface Youtube_Channel_Stats {
  hiddenSubscriberCount: boolean | null
  subscriberCount: string | number | null
  videoCount: string | number | null
  viewCount: string | number | null
}