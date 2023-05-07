import { defineStore } from "pinia";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    indexUrl: "https://#",
    indexKey: "abcdefg",
    confirmed: false,
    currentIndex: "",
    currentInstance: null,
    instances: [],
  }),
  persist: true,
});
