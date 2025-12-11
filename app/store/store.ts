import { defineStore } from "pinia";
import type {
  Admin_User,
  Game_Genre_Name,
  Game_Genre_Slug,
  StoreNpmRunGame,
} from "~/composables/core/interfaces";

const store = defineStore("npmrungame_store", {
  state: (): StoreNpmRunGame => ({
    isAdmin: false,
    theme: "dark",
    active_game_platform: "All",
    active_admin_list_item: "dashboard",
    admin_user: null,
    active_blog_id: null,
    hasAnySuccessfulLogin: false,
    prevPage: null,
    currentPage: 1,
    nextPage: null,
    active_detailed_game: { id: null, name: null },
    active_game_genre: {
      title: "Aksiyon",
      slug: "adventure",
      // @ts-ignore
      type: "genre",
    },
    active_games_endpoint: null,
  }),

  actions: {
    changeTheme() {
      this.theme == "dark" ? (this.theme = "light") : (this.theme = "dark");
    },
    changeGamePlatform(platform: "pc" | "ps5" | "xbox" | "nintendo" | "star") {
      this.active_game_platform = platform;
    },
    clearActiveGamePlatform() {
      this.active_game_platform = "All";
    },
    setPagination(current: number, next: string | null, prev: string | null) {
      this.currentPage = current;
      this.nextPage = next;
      this.prevPage = prev;
    },
    setActiveAdminListItem(
      item:
        | "dashboard"
        | "completed_games"
        | "to_play_games"
        | "blog"
        | "messages"
        | "current_games"
        | "recommended_games"
    ) {
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
      type: "genre" | "tag"
    ) {
      this.active_game_genre = {
        // @ts-ignore
        slug,
        title,
        type,
      };
    },
    setActiveGameEndpoint(endpoint: string) {
      this.active_games_endpoint = endpoint;
    },
    clearToActiveGameGenre() {
      this.active_game_genre.slug = null;
      this.active_game_genre.title = null;
    },
    setActiveBlogId(id: string) {
      this.active_blog_id = id;
    },
    setAnySuccessfullLogin() {
      this.hasAnySuccessfulLogin = true;
    },
  },
  persist: piniaPluginPersistedstate.localStorage(),
});

export default store;
