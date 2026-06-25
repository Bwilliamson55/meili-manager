<template>
  <q-card flat bordered class="h-full flex flex-col">
    <q-card-section class="p-4 flex-shrink-0">
      <div class="flex items-center justify-between mb-3">
        <span class="text-subtitle2 font-semibold dark:text-white">
          Filters
          <span
            v-if="filterableAttributes.length"
            class="text-caption text-gray-500 dark:text-gray-400 ml-1"
          >
            ({{ filterableAttributes.length }})
          </span>
        </span>
        <div class="flex gap-1">
          <AisClearButton label="Clear" />
          <q-btn
            flat
            dense
            size="sm"
            icon="close"
            class="dark:text-gray-300"
            @click="$emit('close')"
          />
        </div>
      </div>

      <AisCurrentRefinements container-class="mb-2" chip-size="sm" />
    </q-card-section>

    <q-separator />

    <q-card-section class="p-4 pt-3 flex-1 min-h-0">
      <div class="text-subtitle2 font-semibold mb-3 dark:text-white">
        Filter By
      </div>

      <div
        v-if="filterableAttributes.length > 0"
        class="overflow-y-auto space-y-3 pr-1"
        style="max-height: calc(100vh - 340px); min-height: 12rem"
      >
        <q-card
          v-for="att in filterableAttributes"
          :key="att"
          flat
          bordered
          class="rounded-md"
        >
          <q-card-section class="p-3">
            <div
              class="text-sm font-semibold mb-2 dark:text-gray-200 break-all"
            >
              {{ att }}
            </div>
            <AisRefinementList
              :attribute="att"
              :show-more="true"
              :show-more-limit="50"
              :density="filterDensity"
            />
          </q-card-section>
        </q-card>
      </div>

      <div v-else class="text-caption text-gray-600 dark:text-gray-400">
        No filterable attributes on this index. Add them in the Settings tab,
        click Submit Settings, and the facets will appear here.
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import AisClearButton from "components/aisComponents/AisClearButton.vue";
import AisCurrentRefinements from "components/aisComponents/AisCurrentRefinements.vue";
import AisRefinementList from "components/aisComponents/AisRefinementList.vue";

defineProps({
  filterableAttributes: {
    type: Array,
    default: () => [],
  },
  filterDensity: {
    type: String,
    default: "comfortable",
  },
});

defineEmits(["close"]);
</script>
