<template>
  <q-layout view="hHh lpR lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          <q-btn dense flat to="/">
            <img style="max-width: 35px" src="~assets/meili-logo.svg" />
            &nbsp;Meilisearch Manager</q-btn
          >
        </q-toolbar-title>
        <q-tabs>
          <q-route-tab
            to="/preview"
            exact
            name="preview"
            label="Preview"
            class="bg-grey-7 text-white"
          />
          <q-route-tab to="/keys" exact name="keys" label="Keys" />
          <q-route-tab to="/tasks" exact name="tasks" label="Tasks" />
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
      <div v-if="!confirmed">
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
import { useSettingsStore } from "src/stores/settings-store";
import { storeToRefs } from "pinia";

const theSettings = useSettingsStore();
const { confirmed } = storeToRefs(theSettings);
const leftDrawerOpen = ref(false);
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};
</script>
