import { defineStore } from "pinia";
import type { StoreNpmRunGame } from "~/composables/core/interfaces";

const store = defineStore("npmrungame_store", {
  state: (): StoreNpmRunGame => ({
    theme: "dark",
    active_game_platform: "All"
  }),
  actions: {
    changeTheme() {
      this.theme == "dark" ? (this.theme = "light") : (this.theme = "dark");
    },
    changeGamePlatform(platform: "pc" | "ps5" | "xbox" | "nintendo" | "star") {
      this.active_game_platform = platform
    },
    clearActiveGamePlatform() {
      this.active_game_platform = "All"
    }
  },
  persist: true,
});

export default store;
