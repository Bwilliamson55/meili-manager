import { defineStore, acceptHMRUpdate } from "pinia";
import { MeiliSearch } from "meilisearch";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    indexUrl: "https://#",
    indexKey: "abcdefg",
    confirmed: false,
    currentIndex: "",
    currentInstance: null,
    instances: [],
  }),
  getters: {
    // Create fresh client on-demand (no caching, no reactivity issues)
    client: (state) => {
      // Only create client if we have valid-looking credentials
      if (
        !state.indexUrl ||
        state.indexUrl === "https://#" ||
        !state.indexKey
      ) {
        throw new Error("Meilisearch credentials not configured");
      }
      return new MeiliSearch({
        host: state.indexUrl,
        apiKey: state.indexKey,
      });
    },
  },
  actions: {
    // Validate connection (separate from client creation)
    async validateConnection() {
      try {
        const version = await this.client.getVersion();
        this.confirmed = true;
        return version;
      } catch (error) {
        this.confirmed = false;
        throw error;
      }
    },

    // Get index client
    getIndexClient(indexName) {
      return this.client.index(indexName);
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

    // Switch instance with validation
    async switchInstance(instanceIndex) {
      const instance = this.instances[instanceIndex];
      if (!instance) {
        throw new Error("Instance not found");
      }

      // Update credentials (client getter will automatically use new values)
      this.indexUrl = instance.indexUrl;
      this.indexKey = instance.indexKey;
      this.currentInstance = instanceIndex;

      // Validate new instance
      await this.validateConnection();
    },

    // Add instance with validation
    async addInstance(label, url, key) {
      const newInstance = { label, indexUrl: url, indexKey: key };

      // Validate before adding
      try {
        const testClient = new MeiliSearch({
          host: url,
          apiKey: key,
        });
        await testClient.getVersion();

        this.instances.push(newInstance);
        return this.instances.length - 1;
      } catch (error) {
        throw new Error(`Invalid instance: ${error.message}`);
      }
    },

    // Remove instance
    removeInstance(instanceIndex) {
      if (this.currentInstance === instanceIndex) {
        throw new Error("Cannot remove active instance");
      }
      this.instances.splice(instanceIndex, 1);

      // Adjust currentInstance if needed
      if (this.currentInstance > instanceIndex) {
        this.currentInstance--;
      }
    },

    // Reset connection state (for credential changes)
    resetConnectionState() {
      this.confirmed = false;
    },
  },
  persist: {
    paths: [
      "indexUrl",
      "indexKey",
      "currentIndex",
      "currentInstance",
      "instances",
    ],
    // Exclude runtime state: activeClient, clientError, isConnecting, confirmed
  },
});
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot));
}
