<template>
  <q-page padding>
    <div class="flex flex-col gap-4">
      <q-card flat bordered>
        <q-card-section>
          <div class="flex items-center justify-between gap-4">
            <q-btn
              flat
              icon="arrow_back"
              class="flex-shrink-0"
              :to="`/index-details/${currentIndex}`"
              >Back</q-btn
            >
            <p class="flex-1 text-center">
              Document Details for UID
              <strong>{{ theDocumentUid ?? "???" }}</strong> in
              <strong>{{ currentIndex ?? "???" }}</strong>
            </p>
            <q-btn
              flat
              icon="save"
              class="flex-shrink-0"
              @click="updateDocument"
              >Save</q-btn
            >
          </div>
          <q-banner class="bg-primary text-white text-center mt-4">
            Saving a document with the same UID as another will overwrite it!
          </q-banner>
        </q-card-section>
      </q-card>
      <vue-jsoneditor
        v-if="theDocumentUid !== ''"
        class="min-h-96"
        mode="tree"
        :queryLanguagesIds="queryLanguages"
        v-model:json="theDocument"
        @error="onError"
        @focus="onFocus"
        @blur="onBlur"
      />
    </div>
  </q-page>
</template>

<script setup>
import { useSettingsStore } from "src/stores/settings-store";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import VueJsoneditor from "vue3-ts-jsoneditor";
import { showSuccess, showError } from "src/utils/notifications";
const theSettings = useSettingsStore();
const { currentIndex } = storeToRefs(theSettings);
const route = useRoute();
const theDocument = ref({});
const theDocumentUid = ref("");
const iPk = ref("");

onMounted(async () => {
  try {
    currentIndex.value = route.params.indexUid;
    const mclient = theSettings.getIndexClient(currentIndex.value);
    iPk.value = await mclient.fetchPrimaryKey();
    theDocument.value = await mclient.getDocument(route.params.documentUid);
    theDocumentUid.value = theDocument.value[iPk.value] ?? "newIdChangeMe1234";
    if (route.params.documentUid == "new") {
      theDocument.value = {
        array: [1, 2, 3],
        boolean: true,
        Null: null,
        number: 123,
        seconds: 0,
        object: { a: "b", c: "d" },
        string: "Hello World",
        name: "new document name",
      };
      theDocument.value[iPk.value] = theDocumentUid.value;
    } else {
      theDocument.value = await mclient.getDocument(route.params.documentUid);
    }
  } catch (error) {
    showError(`Failed to load document: ${error.message}`);
  }
});

const updateDocument = async () => {
  try {
    const mclient = theSettings.getIndexClient(currentIndex.value);
    theDocumentUid.value = theDocument.value[iPk.value];
    const updateResult = await mclient.addDocuments([theDocument.value]);

    // waitForTask is on the client.tasks object in SDK 0.53.0
    await theSettings.client.tasks.waitForTask(updateResult.taskUid, {
      timeOutMs: 15000,
    });
    theDocument.value = await mclient.getDocument(theDocumentUid.value);
    showSuccess("Document Updated");
  } catch (error) {
    showError(`Failed to update document: ${error.message}`);
    // Reload the document to show current state
    try {
      const mclient = theSettings.getIndexClient(currentIndex.value);
      theDocument.value = await mclient.getDocument(route.params.documentUid);
    } catch (reloadError) {
      console.error("Failed to reload document:", reloadError);
    }
  }
};

const queryLanguages = ref(["javascript", "lodash", "jmespath"]);
const onError = (error) => {
  //
};
const onFocus = () => {
  //
};
const onBlur = () => {
  //
};
</script>
