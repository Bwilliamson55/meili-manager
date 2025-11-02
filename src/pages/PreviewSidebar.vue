<template>
  <div class="q-pa-md">
    <div class="text-center text-bold border-bottom q-mb-sm">
      MeiliSearch Preview Settings
    </div>
    <q-card flat bordered>
      <q-form @submit="updatePreviewIndex()">
        <q-card-section>
          <div class="text-subtitle2">Preview Index Host</div>
          <q-input
            filled
            v-model="previewIndexUrl"
            label="The MeiliSearch index URL"
            hint="https://myEngine.com"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Please type something',
            ]"
          />
          <div class="text-subtitle2">Preview Index Key</div>
          <q-input
            v-model="previewIndexKey"
            filled
            disabled
            :type="isPwd ? 'password' : 'text'"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <div class="text-subtitle2">Index Name</div>
          <q-input
            filled
            v-model="previewCurrentIndex"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Please type something',
            ]"
          />
        </q-card-section>
      </q-form>
    </q-card>
    <q-card flat bordered>
      <q-expansion-item
        v-model="filtersExpanded"
        :icon="indexSettings ? 'list' : 'warning'"
        label="Index Settings"
        :class="indexSettings ? 'text-normal' : 'text-red'"
      >
        <q-card-section v-if="indexSettings">
          <div class="text-subtitle2">Displayed Attributes</div>
          <div class="text-normal">
            {{ indexSettings.displayedAttributes ?? "none" }}
          </div>
          <div class="text-subtitle2">Searchable Attributes</div>
          <div class="text-normal">
            {{ indexSettings.searchableAttributes ?? "none" }}
          </div>
          <div class="text-subtitle2">Filterable Attributes</div>
          <div class="text-normal">
            {{ indexSettings.filterableAttributes ?? "none" }}
          </div>
          <div class="text-subtitle2">Sortable Attributes</div>
          <div class="text-normal">
            {{ indexSettings.sortableAttributes ?? "none" }}
          </div>
          <div class="text-subtitle2">Distinct Attribute</div>
          <div class="text-normal">
            {{ indexSettings.distinctAttribute ?? "none" }}
          </div>
          <div class="text-subtitle2">Faceting</div>
          <div class="text-normal">
            {{ indexSettings.faceting ?? "none" }}
          </div>
          <div class="text-subtitle2">Pagination</div>
          <div class="text-normal">
            {{ indexSettings.pagination ?? "none" }}
          </div>
          <div class="text-subtitle2">Ranking Rules</div>
          <div class="text-normal">
            {{ indexSettings.rankingRules ?? "none" }}
          </div>
          <div class="text-subtitle2">Stop Words</div>
          <div class="text-normal">
            {{ indexSettings.stopWords ?? "none" }}
          </div>
          <div class="text-subtitle2">Synonyms</div>
          <div class="text-normal">
            {{ indexSettings.synonyms ?? "none" }}
          </div>
          <div class="text-subtitle2">Typo Tolerance</div>
          <div class="text-normal">
            {{ indexSettings.typoTolerance ?? "none" }}
          </div>
        </q-card-section>
        <q-card-section v-else>
          <div class="warning">
            <div class="text-subtitle2">No Index Settings</div>
            <div class="text-normal">
              Please select an index to view its settings, and be sure your API
              Key has the `settings.get` permission for your index.
            </div>
          </div>
        </q-card-section>
      </q-expansion-item>
    </q-card>
    <div class="text-center text-bold border-bottom q-my-sm">Configuration</div>
    <q-card flat bordered>
      <q-banner rounded dense class="bg-primary text-white text-bold">
        Auto filled dropdown values from your index will
        <strong>not work</strong> without the
        <code class="bg-black">settings.get</code>
        permission.
      </q-banner>
      <q-card-section>
        <q-input
          v-model="previewSettings.name"
          label="Name"
          filled
          dense
          class="q-mb-sm"
        />
        <q-toggle
          v-model="previewSettings.pagination"
          label="Pagination"
          dense
          class="q-mb-sm"
        />
        <q-select
          v-if="previewSettings.pagination"
          v-model="previewSettings.paginationSize"
          :options="previewSettings.paginationSizeOptions"
          label="Pagination Size"
          filled
          dense
          class="q-mb-sm"
        />
        <q-toggle
          v-model="previewSettings.showRefinements"
          label="Show Refinements"
          dense
          class="q-mb-sm"
        />
        <q-toggle
          v-model="previewSettings.showClearRefinements"
          label="Show Clear Refinements"
          dense
          class="q-mb-sm"
        />
        <q-item-label header
          >Input text to filter, press enter to add the value, or click one of
          the results</q-item-label
        >
        <q-select
          v-model="previewSettings.sortableAttributes"
          label="Sortable Attributes"
          filled
          dense
          use-input
          use-chips
          multiple
          input-debounce="0"
          :options="attributeCodesForDropdowns"
          new-value-mode="add-unique"
          @filter="filterFnAttributes"
          class="q-mb-sm"
        />
        <q-select
          v-model="previewSettings.filterKeys"
          label="Facet/Filter Attributes"
          filled
          dense
          use-input
          use-chips
          multiple
          input-debounce="0"
          @new-value="addFilterParent"
          @add="addFilterParent"
          :options="attributeCodesForDropdowns"
          @filter="filterFnAttributes"
          @remove="removeFilter"
          class="q-mb-sm"
        />
        <q-select
          v-model="previewSettings.imageAttributes"
          :options="attributeCodesForDropdowns"
          label="Image Attributes"
          filled
          dense
          use-input
          use-chips
          multiple
          input-debounce="0"
          new-value-mode="toggle"
          @filter="filterFnAttributes"
          class="q-mb-sm"
        />
        <q-select
          v-model="previewSettings.headingAttributes"
          :options="attributeCodesForDropdowns"
          label="Heading Attributes"
          filled
          dense
          use-input
          use-chips
          multiple
          input-debounce="0"
          new-value-mode="toggle"
          @filter="filterFnAttributes"
          class="q-mb-sm"
        />
        <q-select
          v-model="previewSettings.descriptionAttributes"
          :options="attributeCodesForDropdowns"
          label="Description Attributes"
          filled
          dense
          use-input
          use-chips
          multiple
          input-debounce="0"
          new-value-mode="toggle"
          @filter="filterFnAttributes"
          class="q-mb-sm"
        />
      </q-card-section>
      <q-btn
        label="Save"
        color="primary"
        class="q-mb-md q-ml-md"
        @click="previewStore.savePreviewSettings()"
      />
    </q-card>
    <q-list bordered class="rounded-borders">
      <q-item-label header>Preview Instances</q-item-label>
      <template v-if="previewInstances.length > 0">
        <q-item
          v-for="(value, key) in previewInstances"
          :key="key"
          clickable
          v-ripple
          active-class="bg-blue-1"
          class="cursor-pointer"
          :active="previewCurrentInstance == key"
        >
          <q-item-section
            top
            @click="previewStore.loadPreviewSettings(null, key)"
          >
            <q-item-label lines="1">
              {{ value?.name ?? "" }}
            </q-item-label>
            <q-item-label caption lines="1">
              Sorts: {{ value?.sortableAttributes?.length ?? 0 }} Filters:
              {{ value?.filterKeys?.length ?? 0 }} Images:
              {{ value?.imageAttributes?.length ?? 0 }}
            </q-item-label>
          </q-item-section>

          <q-item-section top side>
            <div class="text-grey-8 q-gutter-xs">
              <q-btn
                size="12px"
                flat
                dense
                round
                icon="delete"
                @click="previewStore.deletePreviewSettings(null, key)"
              />
            </div>
          </q-item-section>
        </q-item>
      </template>
    </q-list>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useSettingsStore } from "src/stores/settings-store";
import { usePreviewStore } from "src/stores/preview-store";
import { storeToRefs } from "pinia";

const theSettings = useSettingsStore();
const previewStore = usePreviewStore();
const { indexUrl, indexKey, currentIndex } = storeToRefs(theSettings);
const indexSettings = ref({});
const filtersExpanded = ref(false);
const attributeCodesForDropdowns = ref([]);
const isPwd = ref(true);

const {
  previewIndexUrl,
  previewIndexKey,
  previewCurrentIndex,
  previewSettings,
  previewInstances,
  previewCurrentInstance,
} = storeToRefs(previewStore);

const types = {
  menu: ["refinementList", "menu", "hierarchicalMenu"],
  number: ["numericMenu", "rangeInput", "rangeSlider"],
  rating: ["ratingMenu"],
  toggle: ["toggleRefinement"],
};

const filterFnAttributes = (val, update) => {
  setTimeout(() => {
    update(
      () => {
        if (val === "") {
          attributeCodesForDropdowns.value =
            indexSettings.value.attributeCodes?.sort();
        } else {
          const needle = val.toLowerCase();
          attributeCodesForDropdowns.value =
            attributeCodesForDropdowns.value.filter(
              (v) => v.toLowerCase().indexOf(needle) > -1,
            );
        }
      },
      (ref) => {
        if (
          // Not empty but no other option but the very last one
          val !== "" &&
          ref.options.length > 0 &&
          ref.getOptionIndex() === -1
        ) {
          ref.moveOptionSelection(1, true); // focus the first selectable option and do not update the input-value
          ref.toggleOption(ref.options[ref.optionIndex], true); // toggle the focused option
        }
      },
    );
  }, 500);
};

const addFilterParent = (attribute) => {
  attribute = attribute.value || attribute;
  previewSettings.value.filterKeys.push(attribute);
  Object.assign(previewSettings.value.filters, {
    [attribute]: {
      type: "refinementList",
      options: {},
    },
  });
};

const removeFilter = (attribute) => {
  let filterKey = previewSettings.value.filterKeys.find(
    (f) => f === attribute.value,
  );
  if (filterKey) {
    previewSettings.value.filterKeys.splice(
      previewSettings.value.filterKeys.indexOf(filterKey),
      1,
    );
  }
  delete previewSettings.value.filters[attribute.value];
};
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

onMounted(async () => {
  previewIndexUrl.value =
    deepClone(indexUrl.value) || previewIndexUrl.value || "";
  previewIndexKey.value =
    deepClone(indexKey.value) || previewIndexKey.value || "";
  previewCurrentIndex.value =
    deepClone(currentIndex.value) || previewCurrentIndex.value || "";
  indexSettings.value = await previewStore.getPreviewIndexSettings(
    previewCurrentIndex.value,
  );
  attributeCodesForDropdowns.value =
    indexSettings.value.attributeCodes?.sort() ?? [];
});
</script>
