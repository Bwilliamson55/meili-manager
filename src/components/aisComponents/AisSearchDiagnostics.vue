<template>
  <ais-state-results>
    <template #default="{ results, state }">
      <q-expansion-item
        dense
        dense-toggle
        expand-separator
        icon="analytics"
        label="Search Diagnostics"
        header-class="text-caption text-text-muted"
      >
        <q-card flat bordered square class="bg-page">
          <q-card-section class="text-caption">
            <div class="flex flex-wrap gap-2 mb-3">
              <q-btn
                outline
                dense
                square
                no-caps
                size="sm"
                color="primary"
                icon="terminal"
                label="Open in Playground"
                @click="openInPlayground(state)"
              />
            </div>
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
            <div class="mb-2">
              <strong>Hybrid Enabled:</strong>
              {{ hybridEnabled ? "yes" : "no" }}
            </div>
            <div class="mb-2">
              <strong>Hybrid Embedder:</strong>
              {{ hybridEmbedder || "n/a" }}
            </div>
            <div class="mb-2">
              <strong>Hybrid Semantic Ratio:</strong>
              {{ hybridSemanticRatio ?? "n/a" }}
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </template>
  </ais-state-results>
</template>

<script setup>
const props = defineProps({
  headerEnabled: {
    type: Boolean,
    default: false,
  },
  headerValue: {
    type: String,
    default: "",
  },
  hybridEnabled: {
    type: Boolean,
    default: false,
  },
  hybridEmbedder: {
    type: String,
    default: "",
  },
  hybridSemanticRatio: {
    type: Number,
    default: null,
  },
  indexUid: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["open-playground"]);

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

const openInPlayground = (state) => {
  const body = {
    q: state?.query || "",
    limit: state?.hitsPerPage || 20,
  };
  if (props.hybridEnabled) {
    body.hybrid = {
      embedder: props.hybridEmbedder || undefined,
      semanticRatio: props.hybridSemanticRatio ?? 0.5,
    };
  }
  emit("open-playground", {
    type: "search",
    indexUid: props.indexUid,
    body,
  });
};
</script>
