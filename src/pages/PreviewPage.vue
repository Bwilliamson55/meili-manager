<template>
  <q-page>
    <div class="row justify-center">
      <div class="col-12 col-sm-11">
        <div v-if="confirmed" class="q-ma-sm">
          <ais-instant-search
            :search-client="searchClient"
            :index-name="currentIndex"
            class="row"
          >
            <div class="col col-11 col-sm-3">
              <q-expansion-item
                v-model="filtersExpanded"
                icon="list"
                label="Filters"
              >
                <div class="search-panel__filters">
                  <ais-refinement-list attribute="story" />
                </div>
                <q-card>
                  <q-card-section>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Quidem, eius reprehenderit eos corrupti commodi magni
                    quaerat ex numquam, dolorum officiis modi facere maiores
                    architecto suscipit iste eveniet doloribus ullam aliquid.
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </div>
            <div class="col col-11 col-sm-8 q-mx-sm q-px-sm">
              <ais-search-box placeholder="Search here…" class="searchbox" />
              <ais-hits>
                <template v-slot:item="{ item }">
                  <q-card class="result-card" flat bordered>
                    <q-img :src="item.full_picture">
                      <template v-slot:placeholder>
                        <q-spinner-hourglass size="100px" color="white" />
                      </template>
                    </q-img>
                    <q-card-section>
                      <div class="text-h6">
                        <ais-highlight :hit="item" attribute="from.name" />
                      </div>
                      <div class="text-subtitle2">by John Doe</div>
                    </q-card-section>
                    <q-separator />
                    <q-card-section>
                      <div class="text-body2">
                        <ais-highlight :hit="item" attribute="message" />
                      </div>
                    </q-card-section>
                  </q-card>
                </template>
              </ais-hits>
              <div class="pagination"><ais-pagination /></div>
            </div>
          </ais-instant-search>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useSettingsStore } from "src/stores/settings-store";
import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { storeToRefs } from "pinia";
import { ref, onMounted, watch } from "vue";
import { MeiliSearch } from "meilisearch";
import { useQuasar } from "quasar";
import * as jose from "jose";

const $q = useQuasar();
const filtersExpanded = ref(true);
const theSettings = useSettingsStore();
const { indexUrl, indexKey, confirmed, currentIndex, currentInstance } =
  storeToRefs(theSettings);
const searchClient = instantMeiliSearch(indexUrl.value, indexKey.value);

const formatDate = (dateString) =>
  new Intl.DateTimeFormat("default", { dateStyle: "long" }).format(
    new Date(dateString)
  );
const getClient = () =>
  new MeiliSearch({
    host: indexUrl.value,
    apiKey: indexKey.value,
  });

const jwtEncode = async (payload, secret) => {
  let jwt = await new jose.EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
    .setIssuedAt()
    .setIssuer("urn:meilimanager:issuer")
    .setAudience("urn:meilimanager:audience")
    .setExpirationTime(1748390444) //2025
    .encrypt(secret);
  console.log(jwt);
  return jwt;
};
const jwtDecode = async (jwt, secret) => {
  const exsecret = jose.base64url.decode(
    "zH4NRP1HMALxxCFnRZABFA7GOJtzU_gIj02alfL1lvI"
  );
  const exjwt =
    "eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..MB66qstZBPxAXKdsjet_lA.WHbtJTl4taHp7otOHLq3hBvv0yNPsPEKHYInmCPdDDeyV1kU-f-tGEiU4FxlSqkqAT2hVs8_wMNiQFAzPU1PUgIqWCPsBrPP3TtxYsrtwagpn4SvCsUsx0Mhw9ZhliAO8CLmCBQkqr_T9AcYsz5uZw.7nX9m7BGUu_u1p1qFHzyIg";

  const { payload, protectedHeader } = await jose.jwtDecrypt(jwt, secret, {
    issuer: "urn:meilimanager:issuer",
    audience: "urn:meilimanager:audience",
  });

  console.log(protectedHeader);
  console.log(payload);
};

watch(currentInstance, async () => {
  await loadInstance();
});

const loadInstance = async () => {
  const client = getClient();
  try {
    const index = await client.getIndex("wag-facebook-feed");
  } catch (e) {
    console.log(e);
  }
};

onMounted(async () => {
  loadInstance();
});
</script>
