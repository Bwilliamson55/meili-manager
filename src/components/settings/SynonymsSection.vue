<template>
  <div>
    <q-separator class="q-my-md" />
    <div class="flex items-center justify-between q-mb-sm">
      <div class="text-subtitle2">Synonyms</div>
      <div class="flex gap-2">
        <q-btn
          flat
          dense
          size="sm"
          icon="upload"
          label="Import CSV"
          @click="importSynonyms"
        >
          <q-tooltip>Import synonyms from CSV file</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          size="sm"
          icon="download"
          label="Export CSV"
          @click="exportSynonyms"
          :disable="Object.keys(modelValue).length === 0"
        >
          <q-tooltip>Export synonyms to CSV file</q-tooltip>
        </q-btn>
      </div>
    </div>

    <q-banner dense class="bg-info text-white q-mb-md">
      <div class="text-caption">
        <strong>CSV Format:</strong> Each row should have a key word followed by
        its synonyms. Example:<br />
        <code class="text-white">phone,mobile,smartphone,cellphone</code>
      </div>
    </q-banner>

    <!-- Synonyms Table -->
    <q-table
      v-if="Object.keys(modelValue).length > 0"
      :rows="synonymRows"
      :columns="synonymColumns"
      row-key="key"
      flat
      bordered
      dense
      class="q-mb-md"
      :class="{
        'border-2 border-orange-500': hasFieldChanged('synonyms'),
      }"
    >
      <template v-slot:body-cell-key="props">
        <q-td :props="props">
          <strong>{{ props.row.key }}</strong>
        </q-td>
      </template>
      <template v-slot:body-cell-synonyms="props">
        <q-td :props="props">
          <div class="flex flex-wrap gap-1">
            <q-chip
              v-for="(syn, idx) in props.row.synonyms"
              :key="idx"
              size="sm"
              removable
              @remove="props.row.synonyms.splice(idx, 1)"
            >
              {{ syn }}
            </q-chip>
            <q-chip
              size="sm"
              clickable
              icon="add"
              color="primary"
              text-color="white"
              @click="addSynonymToGroup(props.row.key)"
            >
              Add
            </q-chip>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="delete"
            color="negative"
            @click="deleteSynonymGroup(props.row.key)"
          >
            <q-tooltip>Delete group</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Add New Synonym Group -->
    <div class="flex items-start gap-2">
      <q-input
        filled
        v-model="newSynonymKey"
        label="New Synonym Group"
        hint="Enter a key word and press Enter"
        @keydown.enter.prevent="addNewSynonymGroup"
        class="flex-1"
      >
        <template #append>
          <q-btn
            flat
            dense
            round
            icon="add"
            @click="addNewSynonymGroup"
            :disable="!newSynonymKey"
          />
        </template>
      </q-input>
      <SettingsHelp
        :metadata="SETTINGS_METADATA.synonyms"
        :current-value="modelValue"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useSettingsStore } from "src/stores/settings-store";
import { storeToRefs } from "pinia";
import Papa from "papaparse";
import { showSuccess, showError, showPrompt } from "src/utils/notifications";
import SettingsHelp from "src/components/SettingsHelp.vue";
import { SETTINGS_METADATA } from "src/utils/settings-config";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  hasFieldChanged: {
    type: Function,
    required: true,
  },
});

const theSettings = useSettingsStore();
const { currentIndex } = storeToRefs(theSettings);

const newSynonymKey = ref("");

const synonymColumns = [
  {
    name: "key",
    label: "Key Word",
    field: "key",
    align: "left",
    style: "width: 200px",
  },
  {
    name: "synonyms",
    label: "Synonyms",
    field: "synonyms",
    align: "left",
  },
  {
    name: "actions",
    label: "",
    field: "actions",
    align: "right",
    style: "width: 60px",
  },
];

const synonymRows = computed(() => {
  return Object.keys(props.modelValue).map((key) => ({
    key,
    synonyms: props.modelValue[key],
  }));
});

function addNewSynonymGroup() {
  const key = newSynonymKey.value.trim();
  if (key && !props.modelValue[key]) {
    props.modelValue[key] = [];
    newSynonymKey.value = "";
    showSuccess(`Added synonym group for '${key}'`);
  } else if (props.modelValue[key]) {
    showError(`Synonym group '${key}' already exists`);
  }
}

function addSynonymToGroup(key) {
  showPrompt(`Add synonym to '${key}'`, "Enter a synonym:", (synonym) => {
    const trimmed = synonym.trim();
    if (trimmed && !props.modelValue[key].includes(trimmed)) {
      props.modelValue[key].push(trimmed);
    }
  });
}

function deleteSynonymGroup(key) {
  delete props.modelValue[key];
}

function importSynonyms() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".csv";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        let imported = 0;
        let errors = 0;

        results.data.forEach((row) => {
          if (!row || row.length === 0 || !row[0]) return;

          const key = row[0].trim();
          const synonyms = row
            .slice(1)
            .filter((s) => s && s.trim())
            .map((s) => s.trim());

          if (key && synonyms.length > 0) {
            props.modelValue[key] = synonyms;
            imported++;
          } else {
            errors++;
          }
        });

        if (imported > 0) {
          showSuccess(
            `Imported ${imported} synonym group${imported !== 1 ? "s" : ""}${errors > 0 ? ` (${errors} skipped)` : ""}`,
          );
        } else {
          showError("No valid synonyms found in CSV file");
        }
      },
      error: (error) => {
        showError(`Failed to parse CSV: ${error.message}`);
      },
    });
  };
  input.click();
}

function exportSynonyms() {
  const rows = Object.entries(props.modelValue).map(([key, synonyms]) => [
    key,
    ...synonyms,
  ]);

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${currentIndex.value}-synonyms-${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showSuccess("Synonyms exported to CSV");
}
</script>
