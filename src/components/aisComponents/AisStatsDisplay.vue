<template>
  <ais-stats>
    <template #default="{ nbHits, processingTimeMS }">
      <div class="text-caption text-text-muted">
        {{ nbHits.toLocaleString() }} results in {{ processingTimeMS }}ms
      </div>
    </template>
  </ais-stats>
</template>

<script setup>
// No props needed - stats come from InstantSearch context
</script>
