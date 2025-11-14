import { defineStore, acceptHMRUpdate } from "pinia";
import MeiliSearch from "meilisearch";
import * as jose from "jose";

export const usePreviewStore = defineStore("preview", {
  state: () => ({
    previewIndexUrl: "https://#",
    previewIndexKey: "abcdefg",
    previewCurrentIndex: "",
    previewSettings: {
      name: "",
      pagination: false,
      paginationSize: 10,
      paginationSizeOptions: [10, 20, 50, 100],
      showRefinements: false,
      showClearRefinements: false,
      sortableAttributes: [],
      filterKeys: [],
      filters: {}, // { "attributeName": {"type": "facetType", "options": {} }}
      imageAttributes: [],
      headingAttributes: [],
      descriptionAttributes: [],
    },
    previewInstances: [],
    previewCurrentInstanceName: null,
    previewCurrentInstance: null,
  }),
  actions: {
    deepClone(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    async getPreviewIndexClient(indexName) {
      try {
        const meiliClient = new MeiliSearch({
          host: this.previewIndexUrl,
          apiKey: this.previewIndexKey,
        });
        return meiliClient.index(indexName);
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    async getPreviewIndexSettings(indexName) {
      try {
        const mclient = await this.getPreviewIndexClient(indexName);
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
    async getPreviewIndexStats(indexName) {
      try {
        const mclient = await this.getPreviewIndexClient(indexName);
        let stats = await mclient.getStats();
        return stats;
      } catch (error) {
        console.log(error);
      }
    },
    savePreviewSettings() {
      let rawSettings = this.deepClone(this.previewSettings);
      let settingsInstance = this.previewInstances.find(
        (instance) => instance.name === rawSettings.name,
      );
      if (settingsInstance) {
        settingsInstance = this.deepClone(this.previewSettings);
        this.previewCurrentInstance =
          this.previewInstances.indexOf(settingsInstance);
      } else {
        this.previewCurrentInstance =
          this.previewInstances.push(rawSettings) - 1;
      }
      this.previewCurrentInstanceName = rawSettings.name;
      this.previewSettings = rawSettings;
    },
    loadPreviewSettings(name, key) {
      let settingsInstance = null;
      if (name) {
        settingsInstance = this.previewInstances.find(
          (instance) => instance.name === name,
        );
      } else {
        settingsInstance = this.previewInstances[key];
      }
      if (settingsInstance) {
        let rawSettings = this.deepClone(settingsInstance);
        this.previewCurrentInstance =
          this.previewInstances.indexOf(settingsInstance);
        this.previewSettings = rawSettings;
        this.previewCurrentInstanceName = rawSettings.name;
      }
    },
    deletePreviewSettings(name, key) {
      let settingsInstance = null;
      if (name) {
        settingsInstance = this.previewInstances.find(
          (instance) => instance.name === name,
        );
      } else {
        settingsInstance = this.previewInstances[key];
      }
      if (settingsInstance) {
        this.previewInstances.splice(
          this.previewInstances.indexOf(settingsInstance),
          1,
        );
      }
    },
    // For sharing features later
    async tokenizePreviewSettings() {
      try {
        let token = await jose.base64url.encode(
          JSON.stringify(this.previewSettings),
        );
        return token;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    async getPreviewSettingsToken() {
      try {
        let token = await this.tokenizePreviewSettings();
        return token;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
  persist: true,
});
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePreviewStore, import.meta.hot));
}
