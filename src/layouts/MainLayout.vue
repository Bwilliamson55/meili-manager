<template>
  <q-layout view="hHh lpR lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <q-btn round flat to="/">
            <img style="max-width: 35px" src="~assets/meili-logo.svg"
          /></q-btn>
        </q-toolbar-title>
        <q-tabs v-model="tab" shrink stretch>
          <q-route-tab icon="" to="/indexes" exact>Indexes</q-route-tab>
          <q-route-tab icon="" to="/tasks" exact>Tasks</q-route-tab>
          <q-route-tab icon="" to="/stats" exact>Stats</q-route-tab>
        </q-tabs>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" behavior="mobile" bordered>
      <!-- drawer content -->
      <router-view name="side" />
    </q-drawer>

    <q-page-container>
      <div v-show="!confirmed">
        <q-banner class="text-white text-center bg-red">
          You need to enter and save working credentials in the menu.
        </q-banner>
      </div>
      <router-view name="main" />
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
          MeiliSearch Manager
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
const tab = ref("");
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};
</script>
