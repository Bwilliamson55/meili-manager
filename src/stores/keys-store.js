import { defineStore, acceptHMRUpdate } from "pinia";
import { useSettingsStore } from "./settings-store";

export const useKeysStore = defineStore("keys", {
  state: () => ({
    keys: [],
    loading: false,
    lastFetch: null,
  }),

  getters: {
    // Key statistics
    stats: (state) => {
      const now = new Date();
      const thirtyDaysFromNow = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000,
      );

      return {
        total: state.keys.length,
        expiringSoon: state.keys.filter((k) => {
          if (!k.expiresAt) return false;
          const expiresAt = new Date(k.expiresAt);
          return expiresAt <= thirtyDaysFromNow && expiresAt > now;
        }).length,
        expired: state.keys.filter((k) => {
          if (!k.expiresAt) return false;
          return new Date(k.expiresAt) <= now;
        }).length,
        neverExpire: state.keys.filter((k) => !k.expiresAt).length,
      };
    },

    // Get unique actions across all keys
    allActions: (state) => {
      const actions = new Set();
      state.keys.forEach((k) => k.actions?.forEach((a) => actions.add(a)));
      return Array.from(actions).sort();
    },

    // Get unique indexes across all keys
    allIndexes: (state) => {
      const indexes = new Set();
      state.keys.forEach((k) => k.indexes?.forEach((i) => indexes.add(i)));
      return Array.from(indexes).sort();
    },

    // Get keys by expiration status
    keysByExpiration: (state) => (status) => {
      const now = new Date();
      const thirtyDaysFromNow = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000,
      );

      switch (status) {
        case "expired":
          return state.keys.filter(
            (k) => k.expiresAt && new Date(k.expiresAt) <= now,
          );
        case "expiring":
          return state.keys.filter((k) => {
            if (!k.expiresAt) return false;
            const expiresAt = new Date(k.expiresAt);
            return expiresAt <= thirtyDaysFromNow && expiresAt > now;
          });
        case "never":
          return state.keys.filter((k) => !k.expiresAt);
        default:
          return state.keys;
      }
    },
  },

  actions: {
    // Fetch all keys
    async fetchKeys() {
      this.loading = true;
      try {
        const settingsStore = useSettingsStore();
        const response = await settingsStore.client.getKeys();
        // Add visibility toggle state to each key
        this.keys = (response.results || []).map((key) => ({
          ...key,
          keyVisible: false, // Track visibility state
        }));
        this.lastFetch = new Date();
        return this.keys;
      } catch (error) {
        console.error("Failed to fetch keys:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Get single key details
    async getKey(keyUid) {
      try {
        const settingsStore = useSettingsStore();
        const key = await settingsStore.client.getKey(keyUid);

        // Update key in local state if it exists
        const index = this.keys.findIndex((k) => k.uid === keyUid);
        if (index !== -1) {
          this.keys[index] = {
            ...key,
            keyVisible: this.keys[index].keyVisible,
          };
        }

        return key;
      } catch (error) {
        console.error(`Failed to get key ${keyUid}:`, error);
        throw error;
      }
    },

    // Create new key
    async createKey(keyData) {
      try {
        const settingsStore = useSettingsStore();
        const response = await settingsStore.client.createKey(keyData);

        // Refresh keys after creation
        await this.fetchKeys();

        return response;
      } catch (error) {
        console.error("Failed to create key:", error);
        throw error;
      }
    },

    // Update existing key
    async updateKey(keyUid, updates) {
      try {
        const settingsStore = useSettingsStore();
        const response = await settingsStore.client.updateKey(keyUid, updates);

        // Update key in local state
        const index = this.keys.findIndex((k) => k.uid === keyUid);
        if (index !== -1) {
          this.keys[index] = {
            ...this.keys[index],
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }

        return response;
      } catch (error) {
        console.error(`Failed to update key ${keyUid}:`, error);
        throw error;
      }
    },

    // Delete key
    async deleteKey(keyUid) {
      try {
        const settingsStore = useSettingsStore();
        await settingsStore.client.deleteKey(keyUid);

        // Remove key from local state
        this.keys = this.keys.filter((k) => k.uid !== keyUid);
      } catch (error) {
        console.error(`Failed to delete key ${keyUid}:`, error);
        throw error;
      }
    },

    // Toggle key visibility
    toggleKeyVisibility(keyUid) {
      const key = this.keys.find((k) => k.uid === keyUid);
      if (key) {
        key.keyVisible = !key.keyVisible;
      }
    },

    // Clear all keys from local state
    clearKeys() {
      this.keys = [];
      this.lastFetch = null;
    },
  },

  persist: {
    paths: [], // Don't persist keys for security
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useKeysStore, import.meta.hot));
}
