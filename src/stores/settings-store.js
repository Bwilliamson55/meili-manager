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
    // Centralized client management
    activeClient: null,
    clientError: null,
    isConnecting: false,
  }),
  actions: {
    // Centralized client factory with caching and validation
    async getMeiliClient() {
      if (this.activeClient && !this.clientError) {
        return this.activeClient;
      }

      try {
        this.isConnecting = true;
        this.clientError = null;

        const client = new MeiliSearch({
          host: this.indexUrl,
          apiKey: this.indexKey,
        });

        // Validate connection
        await client.getVersion();

        this.activeClient = client;
        this.confirmed = true;
        return client;
      } catch (error) {
        this.clientError = error.message;
        this.activeClient = null;
        this.confirmed = false;
        throw error;
      } finally {
        this.isConnecting = false;
      }
    },

    // Get index client (uses centralized client)
    async getIndexClient(indexName) {
      try {
        const client = await this.getMeiliClient();
        return client.index(indexName);
      } catch (error) {
        console.error(error);
        throw error;
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
        const mclient = await this.getIndexClient(indexName);
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

      // Update credentials
      this.indexUrl = instance.indexUrl;
      this.indexKey = instance.indexKey;
      this.currentInstance = instanceIndex;

      // Clear cached client to force re-validation
      this.activeClient = null;
      this.clientError = null;

      // Validate new instance
      try {
        await this.getMeiliClient();
        this.confirmed = true;
      } catch (error) {
        this.confirmed = false;
        throw error;
      }
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

    // Invalidate cached client (for credential changes)
    invalidateClient() {
      this.activeClient = null;
      this.clientError = null;
      this.confirmed = false;
    },
  },
  persist: true,
});
