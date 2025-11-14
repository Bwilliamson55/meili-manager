import { defineStore, acceptHMRUpdate } from "pinia";
import { useSettingsStore } from "./settings-store";

export const useTasksStore = defineStore("tasks", {
  state: () => ({
    tasks: [],
    loading: false,
    lastFetch: null,
    autoRefreshInterval: null,
  }),

  getters: {
    // Task statistics
    stats: (state) => {
      return {
        total: state.tasks.length,
        succeeded: state.tasks.filter((t) => t.status === "succeeded").length,
        processing: state.tasks.filter(
          (t) => t.status === "processing" || t.status === "enqueued",
        ).length,
        failed: state.tasks.filter((t) => t.status === "failed").length,
        enqueued: state.tasks.filter((t) => t.status === "enqueued").length,
        canceled: state.tasks.filter((t) => t.status === "canceled").length,
      };
    },

    // Get unique task types
    taskTypes: (state) => {
      const types = new Set(state.tasks.map((t) => t.type));
      return Array.from(types).sort();
    },

    // Get unique index UIDs
    indexUids: (state) => {
      const indexes = new Set(
        state.tasks.map((t) => t.indexUid).filter(Boolean),
      );
      return Array.from(indexes).sort();
    },

    // Get tasks by status
    tasksByStatus: (state) => (status) => {
      return state.tasks.filter((t) => t.status === status);
    },

    // Get tasks by index
    tasksByIndex: (state) => (indexUid) => {
      return state.tasks.filter((t) => t.indexUid === indexUid);
    },

    // Get recent tasks (last 24 hours)
    recentTasks: (state) => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return state.tasks.filter((t) => new Date(t.enqueuedAt) > oneDayAgo);
    },
  },

  actions: {
    // Fetch all tasks
    async fetchTasks(limit = 1000) {
      this.loading = true;
      try {
        const settingsStore = useSettingsStore();
        // In SDK v0.53.0, tasks are accessed via client.tasks property
        const response = await settingsStore.client.tasks.getTasks({ limit });
        this.tasks = response.results || [];
        this.lastFetch = new Date();
        return this.tasks;
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Get single task details
    async getTask(taskUid) {
      try {
        const settingsStore = useSettingsStore();
        const task = await settingsStore.client.getTask(taskUid);

        // Update task in local state if it exists
        const index = this.tasks.findIndex((t) => t.uid === taskUid);
        if (index !== -1) {
          this.tasks[index] = task;
        }

        return task;
      } catch (error) {
        console.error(`Failed to get task ${taskUid}:`, error);
        throw error;
      }
    },

    // Cancel tasks by UID
    async cancelTasks(uids) {
      try {
        const settingsStore = useSettingsStore();
        const response = await settingsStore.client.cancelTasks({ uids });

        // Refresh tasks after cancellation
        await this.fetchTasks();

        return response;
      } catch (error) {
        console.error("Failed to cancel tasks:", error);
        throw error;
      }
    },

    // Delete tasks by UID
    async deleteTasks(uids) {
      try {
        const settingsStore = useSettingsStore();
        const response = await settingsStore.client.deleteTasks({ uids });

        // Remove deleted tasks from local state
        this.tasks = this.tasks.filter((t) => !uids.includes(t.uid));

        return response;
      } catch (error) {
        console.error("Failed to delete tasks:", error);
        throw error;
      }
    },

    // Wait for a task to complete
    async waitForTask(
      taskUid,
      options = { intervalMs: 1000, timeoutMs: 60000 },
    ) {
      try {
        const settingsStore = useSettingsStore();
        const task = await settingsStore.client.waitForTask(taskUid, options);

        // Update task in local state
        const index = this.tasks.findIndex((t) => t.uid === taskUid);
        if (index !== -1) {
          this.tasks[index] = task;
        }

        return task;
      } catch (error) {
        console.error(`Failed to wait for task ${taskUid}:`, error);
        throw error;
      }
    },

    // Start auto-refresh (for monitoring active tasks)
    startAutoRefresh(intervalSeconds = 10) {
      if (this.autoRefreshInterval) {
        this.stopAutoRefresh();
      }

      this.autoRefreshInterval = setInterval(() => {
        // Only refresh if there are processing/enqueued tasks
        const hasActiveTasks = this.tasks.some(
          (t) => t.status === "processing" || t.status === "enqueued",
        );
        if (hasActiveTasks) {
          this.fetchTasks();
        }
      }, intervalSeconds * 1000);
    },

    // Stop auto-refresh
    stopAutoRefresh() {
      if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval);
        this.autoRefreshInterval = null;
      }
    },

    // Clear all tasks from local state
    clearTasks() {
      this.tasks = [];
      this.lastFetch = null;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTasksStore, import.meta.hot));
}
