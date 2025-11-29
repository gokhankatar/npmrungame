import { defineStore } from "pinia";
import type {
  Admin_User,
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
    active_game_genre: {
      title: null,
      slug: null
    },
    active_games_endpoint: null
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
    setActiveAdminListItem(
      item: "dashboard" | "completed_games" | "to_play_games" | "blog" | "current_games"
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
    setActiveGameGenre(slug: "action" | "strategy" | "adventure" | "shooter" | "indie" | "rpg" | "horror" | "souls-like", title: "Aksiyon" | "Strateji" | "Nişancı" | "Indie" | "Rol Yapma" | "Macera" | "Korku" | "Souls-Like") {
      this.active_game_genre = {
        slug,
        title
      };
    },
    setActiveGameEndpoint(endpoint: string) {
      this.active_games_endpoint = endpoint
    },
    clearToActiveGameGenre() {
      this.active_game_genre.slug = null
      this.active_game_genre.title = null
    },
    setActiveBlogId(id: string) {
      this.active_blog_id = id
    },
    setAnySuccessfullLogin() {
      this.hasAnySuccessfulLogin = true;
    }
  },
  persist: piniaPluginPersistedstate.localStorage(),
});

export default store;
