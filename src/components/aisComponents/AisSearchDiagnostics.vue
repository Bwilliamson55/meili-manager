<template>
  <ais-state-results>
    <template #default="{ results }">
      <q-expansion-item
        dense
        dense-toggle
        expand-separator
        icon="analytics"
        label="Search Diagnostics"
        header-class="text-caption text-grey-7"
      >
        <q-card flat bordered class="bg-gray-50 dark:bg-gray-900">
          <q-card-section class="text-caption">
            <div class="mb-2">
              <strong>Request UID:</strong>
              {{ results?.requestUid || "n/a" }}
            </div>
            <div class="mb-2">
              <strong>Processing Time:</strong>
              {{ results?.processingTimeMS ?? results?.processingTimeMs ?? "n/a" }}ms
            </div>
            <div class="mb-2">
              <strong>Ranking Score (first hit):</strong>
              {{ getFirstHitValue(results, "_rankingScore") }}
            </div>
            <div class="mb-2">
              <strong>Ranking Details (first hit):</strong>
              {{ getFirstHitValue(results, "_rankingScoreDetails") }}
            </div>
            <div class="mb-2">
              <strong>Performance Details:</strong>
              {{ formatValue(results?.performanceDetails || results?._rawResults?.[0]?.performanceDetails) }}
            </div>
            <div class="mb-2">
              <strong>Metadata Header:</strong>
              {{
                headerEnabled
                  ? headerValue || "(enabled, empty value)"
                  : "disabled"
              }}
            </div>
            <div class="mb-2">
              <strong>Metadata Payload:</strong>
              {{ formatValue(results?._metadata || results?.metadata) }}
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </template>
  </ais-state-results>
</template>

<script setup>
defineProps({
  headerEnabled: {
    type: Boolean,
    default: false,
  },
  headerValue: {
    type: String,
    default: "",
  },
});

const getFirstHitValue = (results, key) => {
  const firstHit = results?.hits?.[0];
  return formatValue(firstHit?.[key]);
};

const formatValue = (value) => {
  if (value === undefined || value === null) return "n/a";
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
};
</script>
