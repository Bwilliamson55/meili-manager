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
import { showError } from "src/utils/notifications";

const route = useRoute();
const settingsStore = useSettingsStore();
const indexesStore = useIndexesStore();
const loading = ref(false);
const rows = ref([]);
const primaryKey = ref("id");

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
    primaryKey.value = await indexesStore.getPrimaryKey(route.params.indexUid);
    const payload = {
      id: route.params.documentUid,
      limit: 50,
      offset: 0,
      showRankingScore: true,
    };
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
    showError(`Failed to load similar documents: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

onMounted(loadSimilar);
</script>
