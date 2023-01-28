import IndexPageVue from "pages/IndexPage.vue";
import SidebarSettingsVue from "pages/SidebarSettings.vue";
import TasksPageVue from "src/pages/TasksPage.vue";

const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        components: {
          main: IndexPageVue,
          side: SidebarSettingsVue,
        },
      },
      {
        path: "tasks",
        components: {
          main: TasksPageVue,
          side: SidebarSettingsVue,
        },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
