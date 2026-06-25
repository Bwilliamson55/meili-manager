<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 320px; max-width: 480px">
      <q-card-section class="flex items-center justify-between pb-2">
        <div class="text-subtitle1">List field order</div>
        <q-btn flat dense round icon="close" v-close-popup />
      </q-card-section>
      <q-separator />
      <q-card-section class="pt-2">
        <div
          v-if="orderedFields.length === 0"
          class="text-caption text-grey-7"
        >
          No fields selected. Add fields from the List fields picker first.
        </div>
        <q-list v-else bordered separator dense>
          <q-item v-for="(field, index) in orderedFields" :key="field">
            <q-item-section class="min-w-0">
              <q-item-label class="break-all">{{ field }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="flex gap-0.5">
                <q-btn
                  flat
                  dense
                  round
                  size="sm"
                  icon="arrow_upward"
                  :disable="index === 0"
                  @click="moveField(index, -1)"
                />
                <q-btn
                  flat
                  dense
                  round
                  size="sm"
                  icon="arrow_downward"
                  :disable="index === orderedFields.length - 1"
                  @click="moveField(index, 1)"
                />
                <q-btn
                  flat
                  dense
                  round
                  size="sm"
                  icon="close"
                  color="negative"
                  @click="removeField(index)"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Done" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  fields: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue", "update:fields"]);

const orderedFields = ref([]);

watch(
  () => props.fields,
  (next) => {
    orderedFields.value = [...(next || [])];
  },
  { immediate: true, deep: true },
);

const emitFields = () => {
  emit("update:fields", [...orderedFields.value]);
};

const moveField = (index, delta) => {
  const target = index + delta;
  if (target < 0 || target >= orderedFields.value.length) return;
  const next = [...orderedFields.value];
  [next[index], next[target]] = [next[target], next[index]];
  orderedFields.value = next;
  emitFields();
};

const removeField = (index) => {
  orderedFields.value = orderedFields.value.filter((_, i) => i !== index);
  emitFields();
};
</script>
