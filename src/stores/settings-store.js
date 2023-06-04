import { defineStore } from "pinia";
import MeiliSearch from "meilisearch";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    indexUrl: "https://#",
    indexKey: "abcdefg",
    confirmed: false,
    currentIndex: "",
    currentInstance: null,
    instances: [],
  }),
  actions: {
    getIndexClient(indexName) {
      try {
        const meiliClient = new MeiliSearch({
          host: this.indexUrl,
          apiKey: this.indexKey,
        });
        return meiliClient.index(indexName);
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    async getIndexSettings(indexName) {
      try {
        const mclient = this.getIndexClient(indexName);
        let settings = await mclient.getSettings();
        try {
          let stats = await mclient.getStats();
          settings.stats = stats;
          settings.attributeCodes = Object.keys(stats.fieldDistribution);
        } catch (error) {
          console.error(error);
        }
        return settings;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    async getIndexStats(indexName) {
      try {
        const mclient = this.getIndexClient(indexName);
        let stats = await mclient.getStats();
        return stats;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
  persist: true,
});
