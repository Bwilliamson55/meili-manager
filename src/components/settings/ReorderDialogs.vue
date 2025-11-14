<template>
  <!-- Searchable Attributes Reorder Dialog -->
  <q-dialog
    :model-value="showSearchableReorder"
    @update:model-value="emit('update:showSearchableReorder', $event)"
  >
    <q-card style="min-width: 400px" class="bg-dark">
      <q-card-section>
        <div class="text-h6">Reorder Searchable Attributes</div>
        <p class="text-caption text-grey-7">
          <q-icon name="priority_high" size="xs" color="warning" />
          Order matters! Top attributes have higher search priority.
        </p>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-banner dense class="bg-info text-white q-mb-md">
          Fields at the top are searched first and matches in them score higher.
          For example: put "title" before "description" if title matches should
          rank higher.
        </q-banner>
        <VueDraggable
          v-model="modelValue.searchableAttributes"
          handle=".handle"
          animation="150"
        >
          <q-item
            v-for="(attr, index) in modelValue.searchableAttributes"
            :key="attr"
            class="q-mb-xs rounded"
            :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'"
          >
            <q-item-section avatar>
              <q-icon name="drag_indicator" class="handle cursor-move" />
            </q-item-section>
            <q-item-section>
              <q-item-label
                >{{ index + 1 }}. {{ attr }}
                <q-badge
                  v-if="index === 0"
                  color="primary"
                  label="Highest Priority"
                  class="q-ml-xs"
              /></q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                flat
                dense
                round
                size="sm"
                icon="close"
                @click="removeSearchableAttribute(index)"
              />
            </q-item-section>
          </q-item>
        </VueDraggable>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Done" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Ranking Rules Reorder Dialog -->
  <q-dialog
    :model-value="showRankingReorder"
    @update:model-value="emit('update:showRankingReorder', $event)"
  >
    <q-card style="min-width: 400px" class="bg-dark">
      <q-card-section>
        <div class="text-h6">Reorder Ranking Rules</div>
        <p class="text-caption text-grey-7">
          Drag rules to change priority (top = highest priority)
        </p>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <VueDraggable
          v-model="modelValue.rankingRules"
          handle=".handle"
          animation="150"
        >
          <q-item
            v-for="(rule, index) in modelValue.rankingRules"
            :key="rule"
            class="q-mb-xs rounded"
            :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'"
          >
            <q-item-section avatar>
              <q-icon name="drag_indicator" class="handle cursor-move" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ index + 1 }}. {{ rule }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                flat
                dense
                round
                size="sm"
                icon="close"
                @click="removeRankingRule(index)"
              />
            </q-item-section>
          </q-item>
        </VueDraggable>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Done" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useQuasar } from "quasar";
import { VueDraggable } from "vue-draggable-plus";

const $q = useQuasar();

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  showSearchableReorder: {
    type: Boolean,
    required: true,
  },
  showRankingReorder: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits([
  "update:showSearchableReorder",
  "update:showRankingReorder",
]);

function removeSearchableAttribute(index) {
  props.modelValue.searchableAttributes.splice(index, 1);
}

function removeRankingRule(index) {
  props.modelValue.rankingRules.splice(index, 1);
}
</script>
