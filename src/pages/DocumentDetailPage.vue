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
        mode="text"
        :mainMenuBar="false"
        :navigationBar="false"
        :statusBar="true"
        v-model:text="theDocumentText"
      />
    </div>
  </q-page>
</template>

<script setup>
import { useSettingsStore } from "src/stores/settings-store";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import VueJsoneditor from "vue3-ts-jsoneditor";
import { showSuccess, showError } from "src/utils/notifications";
const theSettings = useSettingsStore();
const { currentIndex } = storeToRefs(theSettings);
const route = useRoute();
const router = useRouter();
const theDocument = ref({});
const theDocumentText = ref("");
const theDocumentUid = ref("");
const iPk = ref("");

onMounted(async () => {
  try {
    currentIndex.value = route.params.indexUid;
    const mclient = theSettings.getIndexClient(currentIndex.value);
    iPk.value = await mclient.fetchPrimaryKey();

    // Check if creating a new document BEFORE trying to fetch
    if (route.params.documentUid == "new") {
      theDocumentUid.value = "newIdChangeMe1234";
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
      theDocumentText.value = JSON.stringify(theDocument.value, null, 2);
    } else {
      // Only fetch if it's an existing document
      theDocument.value = await mclient.getDocument(route.params.documentUid);
      theDocumentUid.value =
        theDocument.value[iPk.value] ?? route.params.documentUid;
      theDocumentText.value = JSON.stringify(theDocument.value, null, 2);
    }
  } catch (error) {
    showError(`Failed to load document: ${error.message}`);
  }
});

const updateDocument = async () => {
  try {
    // Parse the JSON text from the editor
    try {
      theDocument.value = JSON.parse(theDocumentText.value);
    } catch (parseError) {
      showError(`Invalid JSON: ${parseError.message}`);
      return;
    }

    const mclient = theSettings.getIndexClient(currentIndex.value);

    // Get the document UID from the edited document
    theDocumentUid.value = theDocument.value[iPk.value];

    if (!theDocumentUid.value) {
      showError(`Document must have a primary key field: ${iPk.value}`);
      return;
    }

    const isNewDocument = route.params.documentUid === "new";
    const updateResult = await mclient.addDocuments([theDocument.value]);

    // waitForTask is on the client.tasks object in SDK 0.53.0
    await theSettings.client.tasks.waitForTask(updateResult.taskUid, {
      timeOutMs: 15000,
    });

    // Reload the document with the actual UID
    theDocument.value = await mclient.getDocument(theDocumentUid.value);
    theDocumentText.value = JSON.stringify(theDocument.value, null, 2);

    // If this was a new document, navigate to the actual document URL
    if (isNewDocument) {
      await router.push(
        `/documents/${currentIndex.value}/${theDocumentUid.value}`,
      );
      showSuccess("Document Created");
    } else {
      showSuccess("Document Updated");
    }
  } catch (error) {
    showError(`Failed to save document: ${error.message}`);
    // Reload the document to show current state (only if not "new")
    if (route.params.documentUid !== "new") {
      try {
        const mclient = theSettings.getIndexClient(currentIndex.value);
        theDocument.value = await mclient.getDocument(route.params.documentUid);
        theDocumentText.value = JSON.stringify(theDocument.value, null, 2);
      } catch (reloadError) {
        console.error("Failed to reload document:", reloadError);
      }
    }
  }
};
</script>
