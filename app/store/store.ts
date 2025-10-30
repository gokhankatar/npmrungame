import { defineStore } from "pinia";
import type { StoreNpmRunGame } from "~/composables/core/interfaces";

const store = defineStore("npmrungame_store", {
  state: (): StoreNpmRunGame => ({
    theme: "dark",
  }),
  actions: {
    changeTheme() {
      this.theme == "dark" ? (this.theme = "light") : (this.theme = "dark");
    },
  },
  persist: true,
});

export default store;
