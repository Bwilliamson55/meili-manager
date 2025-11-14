import { defineStore, acceptHMRUpdate } from "pinia";
import { useSettingsStore } from "./settings-store";

export const useIndexesStore = defineStore("indexes", {
  state: () => ({
    indexes: [],
    loading: false,
    lastFetch: null,
  }),

  getters: {
    // Index statistics
    stats: (state) => {
      const totalDocs = state.indexes.reduce(
        (sum, idx) => sum + (idx.numberOfDocuments || 0),
        0,
      );

      return {
        total: state.indexes.length,
        totalDocuments: totalDocs,
        recentlyUpdated: state.indexes.filter((idx) => {
          if (!idx.updatedAt) return false;
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return new Date(idx.updatedAt) > dayAgo;
        }).length,
      };
    },

    // Sort indexes by most recently updated
    indexesByDate: (state) => {
      return [...state.indexes].sort((a, b) => {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
    },
  },

  actions: {
    async fetchIndexes() {
      this.loading = true;
      try {
        const settingsStore = useSettingsStore();
        const client = settingsStore.client;
        const result = await client.getRawIndexes();

        this.indexes = result.results || [];
        this.lastFetch = Date.now();
      } catch (error) {
        console.error("Failed to fetch indexes:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getIndex(uid) {
      try {
        const settingsStore = useSettingsStore();
        const client = settingsStore.client;
        return await client.getIndex(uid);
      } catch (error) {
        console.error(`Failed to get index ${uid}:`, error);
        throw error;
      }
    },

    async createIndex(uid, options = {}) {
      this.loading = true;
      try {
        const settingsStore = useSettingsStore();
        const client = settingsStore.client;
        await client.createIndex(uid, options);

        // Refresh indexes list
        await this.fetchIndexes();
      } catch (error) {
        console.error("Failed to create index:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteIndex(uid) {
      this.loading = true;
      try {
        const settingsStore = useSettingsStore();
        const client = settingsStore.client;
        await client.deleteIndex(uid);

        // Refresh indexes list
        await this.fetchIndexes();
      } catch (error) {
        console.error(`Failed to delete index ${uid}:`, error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createDump() {
      try {
        const settingsStore = useSettingsStore();
        const client = settingsStore.client;
        return await client.createDump();
      } catch (error) {
        console.error("Failed to create dump:", error);
        throw error;
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useIndexesStore, import.meta.hot));
}
