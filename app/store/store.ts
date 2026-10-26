import { defineStore } from "pinia";
import type {
  Admin_User,
  AdminListItem,
  Game_Genre_Name,
  Game_Genre_Slug,
  StoreNpmRunGame,
  Game_Filter_Type,
} from "~/composables/core/interfaces";

const store = defineStore("npmrungame_store", {
  state: (): StoreNpmRunGame => ({
    isAdmin: false,
    theme: "dark",
    active_game_platform: "All",
    active_admin_list_item: "dashboard",
    admin_user: null,
    user: null,
    active_blog_id: null,
    hasAnySuccessfulLogin: false,
    isSeenFeatureNewsToast: false,
    prevPage: null,
    currentPage: 1,
    nextPage: null,
    active_detailed_game: { id: null, name: null },
    active_game_genre: null,
    active_games_endpoint: null,
  }),

  actions: {
    changeTheme() {
      // Prefer useAppTheme().setTheme / toggleTheme — kept for backward compat
      this.theme = this.theme === "dark" ? "light" : "dark";
      if (import.meta.client) {
        const root = document.documentElement;
        if (this.theme === "dark") root.classList.add("dark");
        else root.classList.remove("dark");
        root.style.colorScheme = this.theme;
      }
    },
    setResolvedTheme(mode: "dark" | "light") {
      this.theme = mode;
    },
    changeGamePlatform(platform: "pc" | "ps5" | "xbox" | "nintendo" | "star") {
      this.active_game_platform = platform;
    },
    clearActiveGamePlatform() {
      this.active_game_platform = "All";
    },
    setTrueIsSeenFeatureNewsToast() {
      this.isSeenFeatureNewsToast = true;
    },
    setFalseIsSeenFeatureNewsToast() {
      this.isSeenFeatureNewsToast = false;
    },
    setPagination(current: number, next: string | null, prev: string | null) {
      this.currentPage = current;
      this.nextPage = next;
      this.prevPage = prev;
    },
    setActiveAdminListItem(item: AdminListItem) {
      // @ts-ignore
      this.active_admin_list_item = item;
    },
    logOut() {
      this.isAdmin = false;
    },
    login() {
      this.isAdmin = true;
    },
    setAdminUserInfo(admin_user_info: Admin_User) {
      this.admin_user = admin_user_info;
    },
    setActiveDetailedGame(id: number | string, name: string) {
      this.active_detailed_game.id = id;
      this.active_detailed_game.name = name;
    },
    setActiveGameGenre(
      slug: Game_Genre_Slug,
      title: Game_Genre_Name,
      type: Game_Filter_Type
    ) {
      this.active_game_genre = { slug, title, type };
    },
    setActiveGameEndpoint(endpoint: string) {
      this.active_games_endpoint = endpoint;
    },
    clearActiveGameGenre() {
      this.active_game_genre = null;
    },
    setActiveBlogId(id: string) {
      this.active_blog_id = id;
    },
    setAnySuccessfullLogin() {
      this.hasAnySuccessfulLogin = true;
    },
    setUser(user: any) {
      this.user = user;
    },
    clearUser() {
      this.user = null;
    },
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
    // Tema tek kaynak: useAppTheme (npmrungame-theme)
    omit: ["theme"],
  },
});

export default store;
