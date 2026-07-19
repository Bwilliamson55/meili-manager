<template>
  <!-- Unsaved Changes Warning -->
  <q-banner v-if="hasUnsavedSettings" class="bg-warning text-page q-mb-md">
    <template #avatar>
      <q-icon name="edit" size="md" />
    </template>
    <div class="text-subtitle2 font-semibold">Unsaved Changes</div>
    <div class="text-caption">
      You have unsaved settings changes. Click "Submit Settings" to save them.
    </div>
  </q-banner>

  <!-- Re-indexing Warning -->
  <q-banner
    v-if="reindexingFields.length > 0"
    class="bg-warning text-page q-mb-md"
  >
    <template #avatar>
      <q-icon name="warning" size="md" />
    </template>
    <div class="text-subtitle2 font-semibold">
      Changes will trigger re-indexing
    </div>
    <div class="text-caption q-mt-xs">
      These settings will re-index all documents (may take time):
      <div class="flex flex-wrap gap-1 q-mt-xs">
        <q-chip
          v-for="field in reindexingFields"
          :key="field"
          size="sm"
          dense
          color="warning"
          text-color="dark"
        >
          {{ field }}
        </q-chip>
      </div>
    </div>
  </q-banner>
</template>

<script setup>
defineProps({
  hasUnsavedSettings: {
    type: Boolean,
    required: true,
  },
  reindexingFields: {
    type: Array,
    required: true,
  },
});
</script>
