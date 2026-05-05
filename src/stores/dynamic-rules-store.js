import { defineStore, acceptHMRUpdate } from "pinia";
import { useSettingsStore } from "./settings-store";
import {
  listDynamicSearchRules,
  getDynamicSearchRule,
  upsertDynamicSearchRule,
  deleteDynamicSearchRule,
} from "src/services/dynamic-search-rules-api";
import {
  getExperimentalFeatures,
  updateExperimentalFeatures,
} from "src/services/experimental-features-api";

export const useDynamicRulesStore = defineStore("dynamicRules", {
  state: () => ({
    /** @type {Record<string, boolean> | null} */
    experimentalFeatures: null,
    experimentalFeaturesError: null,
    /** Rules list response */
    rulesResults: [],
    listOffset: 0,
    listLimit: 20,
    listTotal: 0,
    /** @type {boolean|null} null = no filter */
    listActiveFilter: null,
    attributePatternsInput: "",
    loading: false,
    listError: null,
    /** Single rule when editing (fresh from API) */
    currentRule: null,
    saving: false,
    deleting: false,
  }),

  getters: {
    dynamicSearchRulesEnabled: (state) => {
      if (!state.experimentalFeatures) return null;
      return state.experimentalFeatures.dynamicSearchRules === true;
    },
  },

  actions: {
    getRawRequest() {
      const settings = useSettingsStore();
      return settings.rawRequest.bind(settings);
    },

    async loadExperimentalFeatures() {
      this.experimentalFeaturesError = null;
      try {
        const data = await getExperimentalFeatures(this.getRawRequest());
        this.experimentalFeatures = data && typeof data === "object" ? { ...data } : {};
      } catch (e) {
        this.experimentalFeatures = null;
        this.experimentalFeaturesError = e?.message || String(e);
      }
    },

    async setDynamicSearchRulesEnabled(enabled) {
      await updateExperimentalFeatures(this.getRawRequest(), {
        dynamicSearchRules: !!enabled,
      });
      await this.loadExperimentalFeatures();
    },

    async fetchRulesList() {
      this.loading = true;
      this.listError = null;
      try {
        const filter = {};
        if (this.listActiveFilter === true || this.listActiveFilter === false) {
          filter.active = this.listActiveFilter;
        }
        const patterns = this.attributePatternsInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (patterns.length) {
          filter.attribute_patterns = patterns;
        }
        const body = {
          offset: Math.max(0, Number(this.listOffset) || 0),
          limit: Math.min(Math.max(Number(this.listLimit) || 20, 1), 100),
        };
        if (Object.keys(filter).length) {
          body.filter = filter;
        }
        const res = await listDynamicSearchRules(this.getRawRequest(), body);
        this.rulesResults = Array.isArray(res?.results) ? res.results : [];
        this.listOffset = typeof res?.offset === "number" ? res.offset : body.offset;
        this.listLimit = typeof res?.limit === "number" ? res.limit : body.limit;
        this.listTotal = typeof res?.total === "number" ? res.total : this.rulesResults.length;
      } catch (e) {
        this.rulesResults = [];
        this.listError = e?.message || String(e);
        throw e;
      } finally {
        this.loading = false;
      }
    },

    async fetchRuleByUid(uid) {
      if (!uid) {
        this.currentRule = null;
        return null;
      }
      const rule = await getDynamicSearchRule(this.getRawRequest(), uid);
      this.currentRule = rule;
      return rule;
    },

    async saveRule(uid, payload) {
      this.saving = true;
      try {
        await upsertDynamicSearchRule(this.getRawRequest(), uid, payload);
        await this.fetchRulesList();
      } finally {
        this.saving = false;
      }
    },

    async removeRule(uid) {
      this.deleting = true;
      try {
        await deleteDynamicSearchRule(this.getRawRequest(), uid);
        if (this.currentRule?.uid === uid) {
          this.currentRule = null;
        }
        await this.fetchRulesList();
      } finally {
        this.deleting = false;
      }
    },

    setListPage(offset) {
      this.listOffset = Math.max(0, Number(offset) || 0);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDynamicRulesStore, import.meta.hot));
}
