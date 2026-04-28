<template>
  <div class="q-gutter-md">
    <div class="flex items-start gap-2">
      <div class="flex-1">
        <q-input
          v-model="embeddersJson"
          type="textarea"
          filled
          autogrow
          label="Embedders JSON"
          hint="Configure embedders for semantic/hybrid search (JSON object)"
          :class="{ 'border-2 border-orange-500': hasFieldChanged('embedders') }"
        />
        <q-btn
          flat
          dense
          size="sm"
          color="secondary"
          icon="check"
          label="Apply Embedders JSON"
          class="mt-1"
          @click="applyEmbeddersJson"
        />
      </div>
      <SettingsHelp
        :metadata="SETTINGS_METADATA.embedders"
        :current-value="modelValue.embedders"
      />
    </div>

    <div class="flex items-start gap-2">
      <div class="flex-1">
        <q-input
          v-model="localizedAttributesJson"
          type="textarea"
          filled
          autogrow
          label="Localized Attributes JSON"
          hint="Array format used by Meilisearch localizedAttributes"
          :class="{
            'border-2 border-orange-500': hasFieldChanged('localizedAttributes'),
          }"
        />
        <q-btn
          flat
          dense
          size="sm"
          color="secondary"
          icon="check"
          label="Apply Localized Attributes JSON"
          class="mt-1"
          @click="applyLocalizedAttributesJson"
        />
      </div>
      <SettingsHelp
        :metadata="SETTINGS_METADATA.localizedAttributes"
        :current-value="modelValue.localizedAttributes"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import SettingsHelp from "src/components/SettingsHelp.vue";
import { SETTINGS_METADATA } from "src/utils/settings-config";
import { showError, showSuccess } from "src/utils/notifications";

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

const embeddersJson = ref("{}");
const localizedAttributesJson = ref("[]");

watch(
  () => props.modelValue.embedders,
  (value) => {
    embeddersJson.value = JSON.stringify(value || {}, null, 2);
  },
  { immediate: true, deep: true },
);

watch(
  () => props.modelValue.localizedAttributes,
  (value) => {
    localizedAttributesJson.value = JSON.stringify(value || [], null, 2);
  },
  { immediate: true, deep: true },
);

const applyEmbeddersJson = () => {
  try {
    const parsed = JSON.parse(embeddersJson.value || "{}");
    if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) {
      showError("Embedders must be a JSON object.");
      return;
    }
    props.modelValue.embedders = parsed;
    showSuccess("Embedders JSON applied.");
  } catch (error) {
    showError(`Invalid embedders JSON: ${error.message}`);
  }
};

const applyLocalizedAttributesJson = () => {
  try {
    const parsed = JSON.parse(localizedAttributesJson.value || "[]");
    if (!Array.isArray(parsed)) {
      showError("Localized attributes must be a JSON array.");
      return;
    }
    props.modelValue.localizedAttributes = parsed;
    showSuccess("Localized attributes JSON applied.");
  } catch (error) {
    showError(`Invalid localized attributes JSON: ${error.message}`);
  }
};
</script>
