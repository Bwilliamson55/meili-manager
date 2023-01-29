import { defineStore } from "pinia";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    indexUrl: "https://#",
    indexKey: "abcdefg",
    confirmed: false,
    currentIndex: "",
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
