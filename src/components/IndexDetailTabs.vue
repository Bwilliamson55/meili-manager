<template>
  <div class="q-pa-md full-width">
    <div class="q-gutter-y-md">
      <q-card>
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="overview" label="Overview" />
          <q-tab name="settings" label="Settings" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="overview">
            <div class="text-h6 text-center">Overview</div>
            <slot name="overview-tab"></slot>
          </q-tab-panel>

          <q-tab-panel name="settings">
            <div class="text-h6 text-center">Settings</div>
            <slot name="settings-tab"></slot>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";

const $q = useQuasar();
const tab = ref("overview");
</script>
