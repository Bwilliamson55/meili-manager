import { defineStore, acceptHMRUpdate } from "pinia";
import { getDefaultIndexSearchState } from "../utils/search-utils";
import { mergeDisplaySettings } from "../utils/display-settings";
import {
  normalizeMeiliHost,
  createMeiliClient,
  getIndexSettingsWithStats,
} from "../utils/meili-client";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    indexUrl: "https://#",
    indexKey: "abcdefg",
    confirmed: false,
    currentIndex: "",
    currentInstance: null,
    instances: [],
    // Per-index display preferences
    indexDisplaySettings: {}, // { indexName: { imageField, listFields, listColumns, listViewMode, compactFieldLimit } }
    // Per-index search state persistence
    indexSearchState: {}, // { indexName: { query: '', filters: {}, sort: '', page: 0, filtersVisible: true, ...search options } }
    // Latest Meilisearch index settings fetched or saved in-session
    indexSettingsCache: {}, // { indexName: { filterableAttributes: [], ... } }
    darkMode: true,
    // Unsaved settings tracking
    hasUnsavedSettings: false,
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
      return createMeiliClient({
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
    // Resolve a task method across SDK shapes (client.X vs client.tasks.X).
    callClientTaskMethod(name, ...args) {
      const client = this.client;
      if (typeof client[name] === "function") {
        return client[name](...args);
      }
      if (typeof client.tasks?.[name] === "function") {
        return client.tasks[name](...args);
      }
      throw new Error(`${name} is not available on this Meilisearch client`);
    },
    async waitForTask(taskUid, options = {}) {
      return this.callClientTaskMethod("waitForTask", taskUid, options);
    },
    async getTasks(options = {}) {
      return this.callClientTaskMethod("getTasks", options);
    },
    async getTask(taskUid) {
      return this.callClientTaskMethod("getTask", taskUid);
    },
    async cancelTasks(options = {}) {
      return this.callClientTaskMethod("cancelTasks", options);
    },
    async deleteTasks(options = {}) {
      return this.callClientTaskMethod("deleteTasks", options);
    },
    async rawRequest(path, options = {}) {
      const headers = new Headers(options.headers || {});
      headers.set("Content-Type", "application/json");
      if (this.indexKey) {
        headers.set("Authorization", `Bearer ${this.indexKey}`);
      }

      const requestOptions = {
        method: options.method || "GET",
        headers,
      };

      if (options.body !== undefined) {
        requestOptions.body =
          typeof options.body === "string"
            ? options.body
            : JSON.stringify(options.body);
      }

      const baseUrl = normalizeMeiliHost(this.indexUrl);
      const requestUrl = new URL(path, `${baseUrl}/`).toString();
      const response = await fetch(requestUrl, requestOptions);
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = errorText || `Request failed with ${response.status}`;
        try {
          const parsed = JSON.parse(errorText);
          errorMessage = parsed?.message || errorMessage;
        } catch {
          // Keep raw text when body is not JSON.
        }
        throw new Error(errorMessage);
      }

      if (response.status === 204) {
        return null;
      }
      return response.json();
    },
    async getIndexSettings(indexName) {
      try {
        return await getIndexSettingsWithStats(this.getIndexClient(indexName));
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
      this.indexUrl = normalizeMeiliHost(instance.indexUrl);
      this.indexKey = instance.indexKey;
      this.currentInstance = instanceIndex;

      // Validate new instance
      await this.validateConnection();
    },

    // Add instance with validation
    async addInstance(label, url, key) {
      const normalizedUrl = normalizeMeiliHost(url);
      const newInstance = {
        label,
        indexUrl: normalizedUrl,
        indexKey: key,
      };

      // Validate before adding
      try {
        const testClient = createMeiliClient({ host: normalizedUrl, apiKey: key });
        await testClient.getVersion();

        this.instances.push(newInstance);
        const instanceIndex = this.instances.length - 1;

        if (this.currentInstance === null) {
          await this.switchInstance(instanceIndex);
        }

        return instanceIndex;
      } catch (error) {
        throw new Error(`Invalid instance: ${error.message}`);
      }
    },

    // Ensure persisted instance selection matches active credentials
    async restoreActiveInstance() {
      if (!this.instances.length) {
        if (
          this.indexUrl &&
          this.indexUrl !== "https://#" &&
          this.indexKey &&
          this.indexKey !== "abcdefg"
        ) {
          try {
            await this.validateConnection();
          } catch {
            this.confirmed = false;
          }
        } else {
          this.confirmed = false;
        }
        return;
      }

      const selectedIndex = this.currentInstance;
      const hasValidSelection =
        typeof selectedIndex === "number" &&
        selectedIndex >= 0 &&
        selectedIndex < this.instances.length;
      const targetIndex = hasValidSelection ? selectedIndex : 0;
      const instance = this.instances[targetIndex];
      const normalizedUrl = normalizeMeiliHost(instance.indexUrl);
      const credentialsMatch =
        this.indexUrl === normalizedUrl && this.indexKey === instance.indexKey;

      if (!hasValidSelection || !credentialsMatch || !this.confirmed) {
        await this.switchInstance(targetIndex);
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

    // Get display settings for an index
    getIndexDisplaySettings(indexName) {
      return mergeDisplaySettings(this.indexDisplaySettings[indexName]);
    },

    // Set display settings for an index
    setIndexDisplaySettings(indexName, settings) {
      this.indexDisplaySettings[indexName] = {
        ...this.getIndexDisplaySettings(indexName),
        ...settings,
      };
    },

    // Get search state for an index
    // Note: page is 0-based to match InstantSearch's internal format (0 = first page)
    getIndexSearchState(indexName) {
      return this.indexSearchState[indexName] || getDefaultIndexSearchState();
    },

    // Set search state for an index
    setIndexSearchState(indexName, state) {
      this.indexSearchState[indexName] = {
        ...this.getIndexSearchState(indexName),
        ...state,
      };
    },

    getIndexSettingsCache(indexName) {
      return this.indexSettingsCache[indexName] || null;
    },

    setIndexSettingsCache(indexName, settings) {
      if (!indexName) return;
      this.indexSettingsCache[indexName] = {
        ...(this.indexSettingsCache[indexName] || {}),
        ...settings,
      };
    },

    // Track unsaved settings changes
    markSettingsUnsaved() {
      this.hasUnsavedSettings = true;
    },

    markSettingsSaved() {
      this.hasUnsavedSettings = false;
    },
  },
  persist: {
    paths: [
      "indexUrl",
      "indexKey",
      "currentIndex",
      "currentInstance",
      "instances",
      "indexDisplaySettings",
      "indexSearchState",
      "darkMode",
      // Don't persist hasUnsavedSettings - should reset on page load
    ],
    // Exclude runtime state: activeClient, clientError, isConnecting, confirmed
  },
});
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot));
}
