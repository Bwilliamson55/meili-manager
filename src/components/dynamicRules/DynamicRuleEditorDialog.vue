<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="max-w-4xl w-full mx-auto">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ isEdit ? `Edit rule: ${uid}` : "New dynamic search rule" }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="flex flex-col gap-4">
        <q-banner rounded class="bg-grey-2 text-grey-9">
          Conditions are combined with <strong>AND</strong>. Lower
          <strong>priority</strong> wins when rules conflict. If different
          documents pin to the same position, ascending priority breaks ties.
        </q-banner>

        <div v-if="!isEdit" class="flex flex-col gap-1">
          <q-input
            v-model="uid"
            label="Rule UID (id)"
            outlined
            dense
            hint="Used in URL path; use letters, numbers, hyphen"
            :disable="loadingRule || saving"
          />
        </div>

        <q-input
          v-model="description"
          label="Description (optional)"
          outlined
          dense
          :disable="saving"
        />

        <div class="flex flex-wrap gap-4 items-end">
          <q-input
            v-model.number="priorityInput"
            type="number"
            label="Priority (optional)"
            outlined
            dense
            class="min-w-[160px]"
            hint="Smaller number = higher precedence. Leave empty for lowest."
            :disable="saving"
            clearable
          />
          <q-toggle v-model="active" label="Active" :disable="saving" />
        </div>

        <div>
          <div class="text-subtitle2 mb-2">Conditions</div>
          <div
            v-for="(row, idx) in conditionRows"
            :key="`c-${idx}`"
            class="flex flex-wrap gap-2 items-end mb-2 p-3 rounded border border-gray-200 dark:border-gray-700"
          >
            <q-select
              v-model="row.scope"
              :options="conditionScopeOptions"
              label="Type"
              outlined
              dense
              emit-value
              map-options
              class="min-w-[140px]"
              :disable="saving"
            />
            <template v-if="row.scope === 'query'">
              <q-input
                v-model="row.contains"
                label="Query contains (substring)"
                outlined
                dense
                class="flex-1 min-w-[200px]"
                :disable="saving"
                clearable
              />
              <q-checkbox
                v-model="row.isEmpty"
                label="Query is empty"
                :disable="saving"
              />
            </template>
            <template v-else>
              <q-input
                v-model="row.start"
                type="datetime-local"
                label="Start (UTC field — see docs)"
                outlined
                dense
                class="min-w-[220px]"
                :disable="saving"
              />
              <q-input
                v-model="row.end"
                type="datetime-local"
                label="End"
                outlined
                dense
                class="min-w-[220px]"
                :disable="saving"
              />
            </template>
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              :disable="saving || conditionRows.length <= 1"
              @click="removeCondition(idx)"
            />
          </div>
          <q-btn
            flat
            color="primary"
            icon="add"
            label="Add condition"
            :disable="saving"
            @click="addCondition"
          />
        </div>

        <q-banner
          v-if="pinPositionDuplicateHint"
          rounded
          class="bg-amber-2 text-amber-10"
        >
          {{ pinPositionDuplicateHint }}
        </q-banner>

        <div>
          <div class="text-subtitle2 mb-2">Pin actions</div>
          <div
            v-for="(row, idx) in pinRows"
            :key="`p-${idx}`"
            class="flex flex-wrap gap-2 items-end mb-2 p-3 rounded border border-gray-200 dark:border-gray-700"
          >
            <q-select
              v-model="row.indexUid"
              :options="indexOptions"
              label="Index"
              outlined
              dense
              emit-value
              map-options
              class="min-w-[200px]"
              use-input
              input-debounce="0"
              @filter="filterIndexes"
              :disable="saving"
            />
            <q-input
              v-model="row.documentId"
              label="Document ID"
              outlined
              dense
              class="flex-1 min-w-[180px]"
              :disable="saving"
            />
            <q-input
              v-model.number="row.position"
              type="number"
              label="Position"
              outlined
              dense
              class="w-28"
              :min="0"
              :disable="saving"
            />
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              :disable="saving || pinRows.length <= 1"
              @click="removePin(idx)"
            />
          </div>
          <q-btn
            flat
            color="primary"
            icon="add"
            label="Add pin"
            :disable="saving"
            @click="addPin"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancel" v-close-popup :disable="saving" />
        <q-btn
          color="primary"
          :label="isEdit ? 'Save' : 'Create'"
          :loading="saving"
          :disable="loadingRule || !canSubmit"
          @click="submit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useIndexesStore } from "src/stores/indexes-store";
import { useDynamicRulesStore } from "src/stores/dynamic-rules-store";
import {
  emptyConditionRow,
  emptyPinActionRow,
  conditionsToApiPayload,
  conditionsFromApi,
  pinActionsFromApi,
  pinActionsToApiPayload,
  validateRuleDraft,
} from "src/utils/dynamic-search-rules";
import { showError } from "src/utils/notifications";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  /** create | edit */
  mode: { type: String, default: "create" },
  /** For edit: rule uid to load */
  ruleUid: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue", "saved"]);

const dynamicRulesStore = useDynamicRulesStore();
const indexesStore = useIndexesStore();

const uid = ref("");
const description = ref("");
const priorityInput = ref(null);
const active = ref(true);
const conditionRows = ref([emptyConditionRow()]);
const pinRows = ref([emptyPinActionRow()]);
const loadingRule = ref(false);

const saving = computed(() => dynamicRulesStore.saving);

const isEdit = computed(() => props.mode === "edit");

const conditionScopeOptions = [
  { label: "Query", value: "query" },
  { label: "Time window", value: "time" },
];

const indexOptions = ref([]);

const allIndexUids = computed(() =>
  (indexesStore.indexes || []).map((i) => i.uid).filter(Boolean),
);

watch(
  allIndexUids,
  (uids) => {
    indexOptions.value = uids;
  },
  { immediate: true },
);

function filterIndexes(val, update) {
  update(() => {
    const needle = (val || "").toLowerCase();
    const base = allIndexUids.value;
    indexOptions.value = needle
      ? base.filter((u) => u.toLowerCase().includes(needle))
      : base;
  });
}

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return;
    await indexesStore.fetchIndexes().catch(() => {});
    indexOptions.value = allIndexUids.value;
    if (isEdit.value && props.ruleUid) {
      await loadExisting(props.ruleUid);
    } else {
      resetCreateForm();
    }
  },
);

function resetCreateForm() {
  uid.value = "";
  description.value = "";
  priorityInput.value = null;
  active.value = true;
  conditionRows.value = [emptyConditionRow()];
  pinRows.value = [emptyPinActionRow()];
}

async function loadExisting(ruleUid) {
  loadingRule.value = true;
  try {
    const rule = await dynamicRulesStore.fetchRuleByUid(ruleUid);
    if (!rule) return;
    uid.value = rule.uid || ruleUid;
    description.value = rule.description ?? "";
    priorityInput.value =
      rule.priority !== undefined && rule.priority !== null ? rule.priority : null;
    active.value = rule.active !== false;
    conditionRows.value = conditionsFromApi(rule.conditions);
    pinRows.value = pinActionsFromApi(rule.actions);
  } catch (e) {
    showError(e?.message || String(e));
    emit("update:modelValue", false);
  } finally {
    loadingRule.value = false;
  }
}

function addCondition() {
  conditionRows.value = [...conditionRows.value, emptyConditionRow()];
}

function removeCondition(idx) {
  if (conditionRows.value.length <= 1) return;
  conditionRows.value.splice(idx, 1);
}

function addPin() {
  pinRows.value = [...pinRows.value, emptyPinActionRow()];
}

function removePin(idx) {
  if (pinRows.value.length <= 1) return;
  pinRows.value.splice(idx, 1);
}

const canSubmit = computed(() => {
  if (!isEdit.value && !uid.value?.trim()) return false;
  const v = validateRuleDraft(conditionRows.value, pinRows.value);
  return v.ok;
});

/** Same position used more than once in this rule (resolved by priority vs other rules; within-rule ties follow server rules). */
const pinPositionDuplicateHint = computed(() => {
  const counts = new Map();
  for (const r of pinRows.value) {
    const p = Math.max(0, Number(r.position) || 0);
    counts.set(p, (counts.get(p) || 0) + 1);
  }
  const dups = [...counts.entries()].filter(([, n]) => n > 1).map(([p]) => p);
  if (!dups.length) return "";
  return `Duplicate pin positions in this rule: ${dups.join(", ")}. Ensure intentional; tie-breaking uses rule priority.`;
});

/** datetime-local → ISO string for API */
function localInputToIso(local) {
  if (!local || typeof local !== "string") return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function buildPayload() {
  const conds = conditionRows.value.map((row) => {
    if (row.scope === "time") {
      return {
        scope: "time",
        start: localInputToIso(row.start),
        end: localInputToIso(row.end),
      };
    }
    return row;
  });

  const apiConditions = conditionsToApiPayload(conds);
  const apiPins = pinActionsToApiPayload(pinRows.value);

  const payload = {
    description: description.value?.trim() || null,
    active: active.value,
    conditions: apiConditions,
    actions: apiPins,
  };

  if (priorityInput.value !== null && priorityInput.value !== "" && !Number.isNaN(Number(priorityInput.value))) {
    payload.priority = Math.max(0, Number(priorityInput.value));
  } else {
    payload.priority = null;
  }

  return payload;
}

async function submit() {
  const v = validateRuleDraft(conditionRows.value, pinRows.value);
  if (!v.ok) {
    showError(v.message);
    return;
  }

  const ruleUid = isEdit.value ? props.ruleUid : uid.value.trim();
  if (!ruleUid) {
    showError("Rule UID is required.");
    return;
  }

  try {
    await dynamicRulesStore.saveRule(ruleUid, buildPayload());
    emit("saved", ruleUid);
    emit("update:modelValue", false);
  } catch (e) {
    showError(e?.message || String(e));
  }
}
</script>
