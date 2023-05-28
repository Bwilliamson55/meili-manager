import IndexPageVue from "pages/IndexPage.vue";
import SidebarSettingsVue from "pages/SidebarSettings.vue";
import TasksPageVue from "src/pages/TasksPage.vue";
import IndexDetailPage from "src/pages/IndexDetailPage.vue";
import KeysPageVue from "src/pages/KeysPage.vue";
import DocumentDetailPage from "src/pages/DocumentDetailPage.vue";
import PreviewPageVue from "src/pages/PreviewPage.vue";
import PreviewSidebarVue from "src/pages/PreviewSidebar.vue";

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
        path: "/tasks",
        components: {
          main: TasksPageVue,
          side: SidebarSettingsVue,
        },
      },
      {
        path: "/keys",
        components: {
          main: KeysPageVue,
          side: SidebarSettingsVue,
        },
      },
      {
        path: "/index-details/:uid",
        components: {
          main: IndexDetailPage,
          side: SidebarSettingsVue,
        },
        props: ["uid"],
      },
      {
        path: "/documents/:indexUid/:documentUid",
        components: {
          main: DocumentDetailPage,
          side: SidebarSettingsVue,
        },
        props: ["indexUid", "documentUid"],
      },
    ],
  },
  {
    path: "/",
    component: () => import("layouts/PreviewLayout.vue"),
    children: [
      {
        path: "/preview",
        components: {
          main: PreviewPageVue,
          side: PreviewSidebarVue,
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
