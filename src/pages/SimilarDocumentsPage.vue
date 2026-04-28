<template>
  <q-page padding>
    <q-card flat bordered class="mb-4">
      <q-card-section class="flex items-center justify-between">
        <q-btn
          flat
          icon="arrow_back"
          :to="`/index-details/${route.params.indexUid}`"
          label="Back"
        />
        <div class="text-center">
          <div class="text-h6">Similar Documents</div>
          <div class="text-caption text-grey-7">
            Source: <strong>{{ route.params.documentUid }}</strong>
          </div>
        </div>
        <q-btn
          flat
          color="primary"
          icon="refresh"
          label="Refresh"
          @click="loadSimilar"
          :loading="loading"
        />
      </q-card-section>
      <q-separator />
      <q-card-section class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <q-input
          v-model="embedder"
          outlined
          dense
          clearable
          label="Embedder (optional)"
          hint="Use when your index has multiple embedders"
        />
        <q-input
          v-model.number="limit"
          type="number"
          outlined
          dense
          label="Limit"
        />
        <q-input
          v-model.number="rankingScoreThreshold"
          type="number"
          outlined
          dense
          clearable
          label="Ranking Score Threshold"
          :min="0"
          :max="1"
          :step="0.01"
        />
      </q-card-section>
    </q-card>

    <q-table
      flat
      bordered
      :rows="rows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :rows-per-page-options="[10, 25, 50]"
    >
      <template #body-cell-id="props">
        <q-td :props="props">
          <q-btn
            flat
            dense
            color="primary"
            :to="`/documents/${route.params.indexUid}/${props.value}`"
            :label="String(props.value)"
          />
        </q-td>
      </template>
      <template #body-cell-score="props">
        <q-td :props="props">{{ formatScore(props.value) }}</q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useSettingsStore } from "src/stores/settings-store";
import { useIndexesStore } from "src/stores/indexes-store";
import { normalizeThreshold } from "src/utils/search-utils";
import { showError } from "src/utils/notifications";

const route = useRoute();
const settingsStore = useSettingsStore();
const indexesStore = useIndexesStore();
const loading = ref(false);
const rows = ref([]);
const primaryKey = ref("id");
const embedder = ref("");
const limit = ref(50);
const rankingScoreThreshold = ref(null);
const availableEmbedders = ref([]);

const columns = [
  { name: "id", label: "Document", field: "id", align: "left", sortable: true },
  {
    name: "score",
    label: "Ranking Score",
    field: "score",
    align: "left",
    sortable: true,
  },
];

const formatScore = (value) =>
  value === undefined || value === null ? "-" : Number(value).toFixed(4);

const loadSimilar = async () => {
  loading.value = true;
  try {
    const mclient = settingsStore.getIndexClient(route.params.indexUid);
    const settings = await mclient.getSettings();
    availableEmbedders.value = Object.keys(settings?.embedders || {});
    if (!availableEmbedders.value.length) {
      showError(
        "Similar documents requires embedders on this index. No embedders are configured.",
      );
      rows.value = [];
      return;
    }
    if (!embedder.value && availableEmbedders.value.length === 1) {
      embedder.value = availableEmbedders.value[0];
    }
    if (!embedder.value?.trim() && availableEmbedders.value.length > 1) {
      showError(
        "Select an embedder before loading similar documents for this index.",
      );
      rows.value = [];
      return;
    }

    primaryKey.value = await indexesStore.getPrimaryKey(route.params.indexUid);
    const payload = {
      id: route.params.documentUid,
      limit: limit.value || 50,
      offset: 0,
      showRankingScore: true,
    };
    payload.embedder = embedder.value.trim();
    const threshold = normalizeThreshold(rankingScoreThreshold.value);
    if (threshold !== undefined) {
      payload.rankingScoreThreshold = threshold;
    }
    const result = await settingsStore.rawRequest(
      `/indexes/${encodeURIComponent(route.params.indexUid)}/similar`,
      {
        method: "POST",
        body: payload,
      },
    );

    rows.value = (result?.hits || []).map((hit) => ({
      id: hit[primaryKey.value] ?? hit.id ?? "(missing-id)",
      score: hit._rankingScore,
    }));
  } catch (error) {
    if (
      error.message?.includes("unknown route") ||
      error.message?.includes("invalid_similar") ||
      error.message?.includes("not found")
    ) {
      showError(
        "Similar endpoint unavailable for this index/version or current API key.",
      );
    } else {
      showError(`Failed to load similar documents: ${error.message}`);
    }
  } finally {
    loading.value = false;
  }
};

onMounted(loadSimilar);
</script>
