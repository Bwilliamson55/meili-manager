<template>
  <q-layout view="hHh lpR lFf" class="bg-page">
    <q-header elevated class="bg-page-elevated text-text">
      <q-toolbar class="min-w-0">
        <q-btn
          flat
          dense
          square
          icon="menu"
          aria-label="Toggle navigation"
          @click="toggleLeftDrawer"
        >
          <q-tooltip>Toggle navigation</q-tooltip>
        </q-btn>

        <q-toolbar-title class="min-w-0 flex-1">
          <q-btn flat dense no-caps square to="/" class="q-px-sm">
            <img
              class="h-7 w-7 shrink-0"
              src="~assets/meili-logo.svg"
              alt=""
            />
            <span class="ml-2 truncate text-body1 text-weight-medium">{{
              brandLabel
            }}</span>
          </q-btn>
        </q-toolbar-title>

        <q-chip
          v-if="activeInstance && $q.screen.gt.xs"
          dense
          square
          outline
          color="primary"
          class="q-mr-sm max-w-xs"
        >
          <span class="truncate">
            {{ activeInstance.label }}
            <span class="text-caption opacity-80"> · {{ shortHost }}</span>
            <span v-if="routeIndexUid" class="text-caption opacity-80">
              · {{ routeIndexUid }}</span
            >
          </span>
          <q-tooltip>
            {{ activeInstance.label }} · {{ activeInstance.indexUrl
            }}{{ routeIndexUid ? ` · ${routeIndexUid}` : "" }}
          </q-tooltip>
        </q-chip>
        <q-chip
          v-else-if="!activeInstance && $q.screen.gt.xs"
          dense
          square
          outline
          color="warning"
          class="q-mr-sm"
          label="Not connected"
        />

        <q-btn
          flat
          dense
          square
          no-caps
          icon="swap_horiz"
          :label="$q.screen.gt.xs ? 'Instance' : undefined"
          to="/instances"
          class="q-mr-xs"
          aria-label="Manage instances"
        >
          <q-tooltip>Manage instances</q-tooltip>
        </q-btn>

        <q-btn flat dense square icon="palette" aria-label="Theme">
          <q-tooltip>Theme</q-tooltip>
          <q-menu square anchor="bottom right" self="top right">
            <q-list style="min-width: 220px" class="bg-page-elevated text-text">
              <q-item-label header class="text-caption text-text-muted">
                Theme
              </q-item-label>
              <q-item
                v-for="theme in themeOptions"
                :key="theme.id"
                clickable
                v-ripple
                :active="theme.id === themeId"
                active-class="bg-page text-primary"
                @click="selectTheme(theme.id)"
              >
                <q-item-section avatar>
                  <div class="flex gap-0.5" aria-hidden="true">
                    <span
                      class="inline-block h-4 w-4 border border-border"
                      :style="{ background: theme.swatches.page }"
                    />
                    <span
                      class="inline-block h-4 w-4 border border-border"
                      :style="{ background: theme.swatches.primary }"
                    />
                    <span
                      class="inline-block h-4 w-4 border border-border"
                      :style="{ background: theme.swatches.elevated }"
                    />
                  </div>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ theme.label }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon
                    v-if="theme.id === themeId"
                    name="check"
                    color="primary"
                    size="sm"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :mini="miniDrawer && $q.screen.gt.sm"
      :width="240"
      :mini-width="64"
      class="bg-page-elevated"
    >
      <q-list padding class="text-text">
        <q-item-label header class="text-caption text-text-muted">
          Navigate
        </q-item-label>

        <q-item
          v-for="link in navLinks"
          :key="link.to"
          clickable
          v-ripple
          :to="link.to"
          exact
          active-class="text-primary bg-page"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>{{ link.label }}</q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <q-item clickable v-ripple @click="miniDrawer = !miniDrawer">
          <q-item-section avatar>
            <q-icon
              :name="miniDrawer ? 'chevron_right' : 'chevron_left'"
            />
          </q-item-section>
          <q-item-section>{{ miniDrawer ? "Expand" : "Collapse" }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <div v-if="!confirmed" class="p-6">
        <q-card
          v-if="!isInstancesRoute"
          flat
          bordered
          square
          class="bg-page-elevated max-w-xl mx-auto"
        >
          <q-card-section>
            <div class="text-h6 mb-2">Connect to Meilisearch</div>
            <p class="text-caption text-text-muted mb-4">
              Add an instance with a working URL and API key to use Indexes,
              Keys, Tasks, and Dynamic rules. Credentials stay in this browser
              only.
            </p>
            <q-btn
              unelevated
              square
              no-caps
              color="primary"
              icon="cloud"
              label="Open Instances"
              to="/instances"
            />
          </q-card-section>
        </q-card>
        <router-view v-if="isInstancesRoute" />
      </div>
      <router-view v-else />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
import { useSettingsStore } from "src/meili-core/stores/settings-store";
import { storeToRefs } from "pinia";
import { themes } from "src/themes/catalog";
import { applyTheme } from "src/themes/applyTheme";

const $q = useQuasar();
const route = useRoute();
const theSettings = useSettingsStore();
const { confirmed, themeId, instances, currentInstance, currentIndex } =
  storeToRefs(theSettings);

// Overlay drawer starts closed on narrow viewports; desktop keeps it open.
const leftDrawerOpen = ref($q.screen.gt.sm);
const miniDrawer = ref(false);

const themeOptions = Object.values(themes).map((theme) => ({
  id: theme.id,
  label: theme.label,
  swatches: {
    page: theme.tokens.page,
    primary: theme.tokens.primary,
    elevated: theme.tokens.pageElevated,
  },
}));

const navLinks = [
  { to: "/", label: "Indexes", icon: "storage" },
  { to: "/instances", label: "Instances", icon: "cloud" },
  { to: "/keys", label: "Keys", icon: "vpn_key" },
  { to: "/tasks", label: "Tasks", icon: "checklist" },
  { to: "/dynamic-rules", label: "Dynamic rules", icon: "rule" },
];

const activeInstance = computed(() => {
  if (
    currentInstance.value === null ||
    currentInstance.value === undefined ||
    !instances.value?.length
  ) {
    return null;
  }
  return instances.value[currentInstance.value] ?? null;
});

const shortHost = computed(() => {
  const url = activeInstance.value?.indexUrl;
  if (!url) return "";
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
});

const routeIndexUid = computed(() => {
  return (
    route.params.uid ||
    route.params.indexUid ||
    (route.path.startsWith("/index-details/") ? currentIndex.value : "") ||
    ""
  );
});

const isInstancesRoute = computed(() => route.path === "/instances");

const brandLabel = computed(() =>
  $q.screen.gt.xs ? "Meilisearch Manager" : "Meili Manager",
);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const selectTheme = (id) => {
  theSettings.setThemeId(id);
};

applyTheme(themeId.value);

watch(themeId, (id) => {
  applyTheme(id);
});

onMounted(async () => {
  try {
    await theSettings.restoreActiveInstance();
  } catch (error) {
    console.warn("Failed to restore active instance:", error.message);
  }
});
</script>
