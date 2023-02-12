<template>
  <q-page padding>
    <div class="q-pa-xs row items-start q-gutter-xs">
      <q-card class="col" flat bordered>
        <q-card-section class="full-width">
          <div class="text-center row">
            <q-btn
              flat
              icon="arrow_back"
              class="float-left cursor-pointer q-py-auto q-my-auto"
              :to="`/index-details/${currentIndex}`"
              >Back</q-btn
            >
            <p class="col q-py-auto q-my-auto">
              Document Details for UID
              <strong>{{ theDocumentUid ?? "???" }}</strong> in
              <strong>{{ currentIndex ?? "???" }}</strong>
            </p>
            <q-btn
              flat
              icon="save"
              class="float-right cursor-pointer q-py-auto q-my-auto"
              @click="updateDocument"
              >Save</q-btn
            >
          </div>
          <q-banner class="bg-primary text-white text-center">
            Saving a document with the same UID as another will overwrite it!
          </q-banner>
        </q-card-section>
      </q-card>
      <vue-jsoneditor
        v-if="theDocumentUid"
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
import { MeiliSearch } from "meilisearch";
import { useSettingsStore } from "src/stores/settings-store";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
import VueJsoneditor from "vue3-ts-jsoneditor";

const $q = useQuasar();
const theSettings = useSettingsStore();
const { indexUrl, indexKey, currentIndex } = storeToRefs(theSettings);
const route = useRoute();
const theDocument = ref({});
const theDocumentUid = ref("");
const iPk = ref("");

const getClient = () =>
  new MeiliSearch({
    host: indexUrl.value,
    apiKey: indexKey.value,
  });

onMounted(async () => {
  const meiliClient = getClient();
  const mclient = meiliClient.index(currentIndex.value);
  currentIndex.value = route.params.indexUid;
  iPk.value = await mclient.fetchPrimaryKey();
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
});

const updateDocument = async () => {
  try {
    const meiliClient = getClient();
    const mclient = meiliClient.index(currentIndex.value);
    theDocumentUid.value = theDocument.value[iPk.value];
    const updateResult = await mclient.addDocuments([theDocument.value]);
    const waitForTaskRes = await mclient.waitForTask(updateResult.taskUid, {
      timeOutMs: 15000,
    });
    theDocument.value = await mclient.getDocument(theDocumentUid.value);
    $q.notify({
      color: "green-4",
      textColor: "white",
      icon: "cloud_done",
      message: "Document Updated",
    });
  } catch (error) {
    $q.notify({
      color: "red-5",
      textColor: "white",
      icon: "warning",
      multiLine: true,
      html: true,
      message: `<p>Something went wrong<br/><pre>${JSON.stringify(
        error,
        null,
        2
      )}</pre></p>`,
    });
    const meiliClient = getClient();
    const mclient = meiliClient.index(currentIndex.value);
    currentIndex.value = route.params.indexUid;
    if (route.params.documentUid === "new") {
      theDocument.value = {
        array: [1, 2, 3],
        boolean: true,
        Null: null,
        number: 123,
        seconds: 0,
        object: { a: "b", c: "d" },
        string: "Hello World",
      };
    } else {
      theDocument.value = await mclient.getDocument(route.params.documentUid);
    }
    iPk.value = await mclient.fetchPrimaryKey();
    theDocumentUid.value = theDocument.value[iPk.value];
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
