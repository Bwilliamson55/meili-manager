import { defineStore, acceptHMRUpdate } from "pinia";
import { useSettingsStore } from "./settings-store";
import { normalizeMeiliIndexStats } from "src/utils/meili-stats-merge";

export const useIndexesStore = defineStore("indexes", {
  state: () => ({
    indexes: [],
    loading: false,
    lastFetch: null,
    /** @type {{ pkgVersion?: string; commitSha?: string } | null} */
    clusterVersion: null,
    /** Raw payload from GET /stats (database size, indexes map, …) — shape varies slightly by Meilisearch version. */
    clusterStats: null,
  }),

  getters: {
    // Index statistics
    stats: (state) => {
      const totalDocs = state.indexes.reduce(
        (sum, idx) =>
          sum + (typeof idx.numberOfDocuments === "number" ? idx.numberOfDocuments : 0),
        0,
      );

      const databaseSizeRaw =
        state.clusterStats?.databaseSize ?? state.clusterStats?.database_size ?? null;

      const usedDbRaw =
        state.clusterStats?.usedDatabaseSize ??
        state.clusterStats?.used_database_size ??
        null;

      const lastClusterUpdate =
        state.clusterStats?.lastUpdate ?? state.clusterStats?.last_update ?? null;

      return {
        total: state.indexes.length,
        totalDocuments: totalDocs,
        databaseSize: databaseSizeRaw,
        usedDatabaseSize: usedDbRaw,
        lastClusterUpdate,
        pkgVersion:
          state.clusterVersion?.pkgVersion || state.clusterVersion?.packageVersion || null,
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
    async listIndexes(client) {
      if (typeof client.getRawIndexes === "function") {
        return client.getRawIndexes();
      }
      return client.getIndexes();
    },

    async fetchIndexes() {
      this.loading = true;
      try {
        const settingsStore = useSettingsStore();
        const client = settingsStore.client;

        const [result, clusterStatsPayload, clusterVersionPayload] =
          await Promise.all([
            this.listIndexes(client),
            settingsStore.rawRequest("/stats").catch(() => null),
            client.getVersion().catch(() => null),
          ]);

        this.clusterStats = clusterStatsPayload;
        this.clusterVersion = clusterVersionPayload;

        let rows = result.results || [];

        const bulkMapRaw = clusterStatsPayload?.indexes;
        const bulkMap =
          bulkMapRaw && typeof bulkMapRaw === "object"
            ? /** @type {Record<string, Record<string, unknown>>} */ (bulkMapRaw)
            : null;

        const settled = await Promise.allSettled(
          rows.map(async (indexRow) => {
            const idxClient = client.index(indexRow.uid);

            let statsPart = bulkMap?.[indexRow.uid]
              ? normalizeMeiliIndexStats(bulkMap[indexRow.uid])
              : null;

            if (!statsPart) {
              try {
                const st = await idxClient.getStats();
                statsPart = normalizeMeiliIndexStats(st);
              } catch {
                statsPart = null;
              }
            }

            const settingsResult = await idxClient
              .getSettings()
              .catch(() => null);

            const filterableAttrs = settingsResult?.filterableAttributes;
            const searchableAttrs = settingsResult?.searchableAttributes;
            const sortableAttrs = settingsResult?.sortableAttributes;
            /** @param {unknown} a */
            const attrCount = (a) => {
              if (a === "*") {
                return "*";
              }
              return Array.isArray(a) ? a.length : null;
            };

            const attrCounts = settingsResult
              ? {
                  filterable: attrCount(filterableAttrs),
                  searchable: attrCount(searchableAttrs),
                  sortable: attrCount(sortableAttrs),
                }
              : null;

            if (!statsPart) {
              return {
                ...indexRow,
                statsLoadError: "Stats unavailable",
                attrCounts,
              };
            }

            return {
              ...indexRow,
              numberOfDocuments:
                typeof statsPart.numberOfDocuments === "number"
                  ? statsPart.numberOfDocuments
                  : indexRow.numberOfDocuments,
              isIndexing: Boolean(statsPart.isIndexing),
              fieldCount: statsPart.fieldCount,
              rawDocumentDbSize: statsPart.rawDocumentDbSize,
              avgDocumentSize: statsPart.avgDocumentSize,
              numberOfEmbeddings: statsPart.numberOfEmbeddings,
              numberOfEmbeddedDocuments: statsPart.numberOfEmbeddedDocuments,
              attrCounts,
            };
          }),
        );

        rows = settled.map((s, i) => {
          if (s.status === "fulfilled") {
            return s.value;
          }
          console.error(
            `Index stats/settings failed for ${rows[i]?.uid}:`,
            s.reason?.message ?? s.reason,
          );
          return {
            ...rows[i],
            statsLoadError: String(s.reason?.message ?? s.reason ?? "failed"),
          };
        });

        this.indexes = rows;
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
        const response = await client.createIndex(uid, options);
        if (response?.taskUid) {
          await client.waitForTask(response.taskUid, {
            timeoutMs: 30000,
          });
        }

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
        const response = await client.deleteIndex(uid);
        if (response?.taskUid) {
          await client.waitForTask(response.taskUid, {
            timeoutMs: 30000,
          });
        }

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

    // Get primary key for an index (with fallback to fetching if not in cache)
    async getPrimaryKey(indexUid) {
      // First try to get from cached indexes
      const cachedIndex = this.indexes.find((idx) => idx.uid === indexUid);
      if (cachedIndex?.primaryKey) {
        return cachedIndex.primaryKey;
      }

      // If not in cache, try to fetch indexes first
      try {
        await this.fetchIndexes();
        const index = this.indexes.find((idx) => idx.uid === indexUid);
        if (index?.primaryKey) {
          return index.primaryKey;
        }
      } catch (error) {
        console.error("Failed to fetch indexes for primary key:", error);
      }

      // Fallback to 'id' if not found
      return "id";
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useIndexesStore, import.meta.hot));
}
