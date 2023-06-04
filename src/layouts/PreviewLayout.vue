<template>
  <q-layout view="hHh lpR lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          <q-btn dense flat to="/preview">
            <img style="max-width: 35px" src="~assets/meili-logo.svg" />
            &nbsp;Meili-Manager - <em>Preview</em></q-btn
          >
        </q-toolbar-title>

        <q-tabs dense>
          <q-route-tab
            to="/"
            exact
            name="manager"
            label="To Manager"
            class="text-white"
          />
        </q-tabs>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      behavior="mobile"
      :width="350"
      bordered
    >
      <!-- drawer content -->
      <router-view name="side" />
    </q-drawer>

    <q-page-container>
      <div v-if="!previewCurrentIndex">
        <q-banner class="text-white text-center bg-red">
          You need to enter and save working credentials in the menu.
        </q-banner>
      </div>
      <router-view v-else name="main" />
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { usePreviewStore } from "src/stores/preview-store";

const theSettings = usePreviewStore();
const { previewCurrentIndex } = storeToRefs(theSettings);
const leftDrawerOpen = ref(false);
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};
</script>
