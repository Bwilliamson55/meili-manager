<template>
  <q-btn
    flat
    dense
    round
    size="sm"
    icon="help_outline"
    color="grey-6"
    @click="showHelp = true"
  >
    <q-tooltip>Learn about this setting</q-tooltip>
  </q-btn>

  <q-dialog v-model="showHelp">
    <q-card style="min-width: 400px; max-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ metadata.label }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <p class="text-body2">{{ metadata.helpText }}</p>

        <q-banner
          v-if="metadata.reindexes"
          class="bg-warning text-black q-mt-md"
          dense
        >
          <template #avatar>
            <q-icon name="warning" />
          </template>
          Changing this setting will re-index all documents
        </q-banner>

        <q-banner
          v-if="performanceImpact"
          :class="`bg-${impactColor} text-white q-mt-md`"
          dense
        >
          <template #avatar>
            <q-icon name="speed" />
          </template>
          {{ performanceImpact.message }}
        </q-banner>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Read Documentation"
          icon="open_in_new"
          color="primary"
          :href="metadata.docs"
          target="_blank"
        />
        <q-btn flat label="Close" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  metadata: {
    type: Object,
    required: true,
  },
  currentValue: {
    type: [String, Number, Array, Object, Boolean],
    default: null,
  },
});

const showHelp = ref(false);

const performanceImpact = computed(() => {
  if (!props.metadata.performanceImpact) return null;

  // Special handling for pagination
  if (
    props.metadata.label === "Pagination" &&
    props.currentValue?.maxTotalHits
  ) {
    const hits = props.currentValue.maxTotalHits;
    if (hits > 20000)
      return { level: "critical", message: "Severely impacts performance" };
    if (hits > 10000)
      return { level: "high", message: "May slow down searches" };
    if (hits > 5000) return { level: "medium", message: "Moderate impact" };
    return { level: "low", message: "Minimal impact" };
  }

  return {
    level: props.metadata.performanceImpact,
    message: `${props.metadata.performanceImpact} performance impact`,
  };
});

const impactColor = computed(() => {
  if (!performanceImpact.value) return "grey";
  switch (performanceImpact.value.level) {
    case "critical":
      return "negative";
    case "high":
      return "warning";
    case "medium":
      return "info";
    default:
      return "positive";
  }
});
</script>
