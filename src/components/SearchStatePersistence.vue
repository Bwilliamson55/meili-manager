<template>
  <!-- This component watches search state and persists it -->
  <!-- Using ais-state-results to access the current search state -->
  <ais-state-results>
    <template #default="{ state: searchState }">
      <!-- Component doesn't render anything visible, just watches state -->
      <div style="display: none;">
        <SearchStateWatcher
          :state="searchState"
          :index-name="indexName"
          @state-changed="$emit('state-changed', $event)"
        />
      </div>
    </template>
  </ais-state-results>
</template>

<script setup>
import { useSettingsStore } from "src/stores/settings-store";
import SearchStateWatcher from "./SearchStateWatcher.vue";

defineProps({
  indexName: {
    type: String,
    required: true,
  },
});

defineEmits(["state-changed"]);
</script>

