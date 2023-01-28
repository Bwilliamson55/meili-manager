import { defineStore } from "pinia";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    indexUrl: "https://#",
    indexKey: "abcdefg",
  }),
  getters: {
    placeHolder: (state) => state.indexUrl,
  },
  actions: {
    testConnection() {
      console.log("wut");
    },
  },
  persist: true,
});
