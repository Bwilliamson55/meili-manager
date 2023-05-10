<template>
  <q-page padding>
    <div class="q-pa-xs row items-start q-gutter-xs">
      <q-card class="col" flat bordered>
        <q-card-section class="full-width">
          <div class="text-center">
            <p>All Tasks</p>
          </div>
          <q-table
            title="All Tasks"
            style="max-height: 100vh"
            virtual-scroll
            :rows="iTasks.results"
            :rows-per-page-options="[10, 20, 50, 0]"
            :filter="filter"
            :columns="columns"
            :loading="loading"
            v-model:expanded="expanded"
            row-key="uid"
            flat
            bordered
          >
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th auto-width />
                <q-th v-for="col in props.cols" :key="col.name" :props="props">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td auto-width>
                  <q-toggle
                    v-model="props.expand"
                    @update:model-value="fetchTaskDetails(props)"
                    checked-icon="add"
                    unchecked-icon="remove"
                  />
                </q-td>
                <q-td v-for="col in props.cols" :key="col.name" :props="props">
                  {{ col.value }}
                </q-td>
              </q-tr>
              <q-tr v-show="props.expand" :props="props">
                <q-td colspan="100%">
                  <div class="text-left">
                    Details for task ID: {{ props.row.uid }}.

                    <div v-if="rowDetails[props.row.uid]" class="row">
                      <q-card
                        flat
                        bordered
                        v-for="col in Object.keys(
                          rowDetails[props.row.uid]['details']
                        )"
                        :key="col.uid"
                      >
                        <q-card-section>
                          <div class="text-overline">{{ col }}:</div>
                          <div>
                            <pre>{{
                              JSON.stringify(
                                rowDetails[props.row.uid]["details"][col],
                                null,
                                2
                              )
                            }}</pre>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </q-td>
              </q-tr>
            </template>
            <template v-slot:top-right>
              <q-input
                borderless
                dense
                debounce="300"
                v-model="filter"
                placeholder="Search"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { MeiliSearch } from "meilisearch";
import { useSettingsStore } from "src/stores/settings-store";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";

const theSettings = useSettingsStore();
const { indexUrl, indexKey } = storeToRefs(theSettings);
const filter = ref("");
const iTasks = ref({});
const loading = ref(false);
const expanded = ref([
  // Array of row keys
]);
const rowDetails = ref({});
const meiliClient = new MeiliSearch({
  host: indexUrl.value,
  apiKey: indexKey.value,
});

const getTaskDetails = async (taskId) => {
  try {
    let resp = await meiliClient.getTask(taskId);
    return resp;
  } catch (e) {
    console.log(e);
    return "Failed to get task details";
  }
};
const fetchTaskDetails = async (props) => {
  loading.value = true;
  let deets = await getTaskDetails(props.key);
  rowDetails.value[props.key] = { ...deets };
  loading.value = false;
};
const columns = [
  { name: "uid", label: "UID", align: "center", sortable: true, field: "uid" },
  {
    name: "indexUid",
    label: "Index UID",
    align: "center",
    sortable: true,
    field: "indexUid",
  },
  {
    name: "status",
    label: "Status",
    align: "center",
    sortable: true,
    field: "status",
  },
  {
    name: "type",
    label: "Type",
    align: "center",
    sortable: true,
    field: "type",
  },
  {
    name: "enqueuedAt",
    label: "Enqueued At",
    align: "center",
    sortable: true,
    field: "enqueuedAt",
    format: (val) => new Date(val).toLocaleString(),
  },
  {
    name: "startedAt",
    label: "Started At",
    align: "center",
    sortable: true,
    field: "startedAt",
    format: (val) => new Date(val).toLocaleString(),
  },
  {
    name: "finishedAt",
    label: "Finished At",
    align: "center",
    sortable: true,
    field: "finishedAt",
    format: (val) => new Date(val).toLocaleString(),
  },
  {
    name: "duration",
    label: "Duration",
    align: "center",
    sortable: true,
    field: "duration",
  },
  {
    name: "canceledBy",
    label: "Canceled By",
    align: "center",
    sortable: true,
    field: "canceledBy",
  },
  {
    name: "error",
    label: "Error",
    align: "center",
    sortable: true,
    field: "error",
    style: "white-space: wrap",
    format: (val) =>
      val
        ? `Code: ${val.code ?? ""} \n Link: ${val.link ?? ""} \n ${
            val.message ?? ""
          } \n ${val.type}`
        : "",
  },
];
onMounted(async () => {
  const meiliClient = new MeiliSearch({
    host: indexUrl.value,
    apiKey: indexKey.value,
  });
  iTasks.value = await meiliClient.getTasks({ limit: 1000 });
});
</script>
