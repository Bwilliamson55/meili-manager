import IndexPageVue from "pages/IndexPage.vue";
import InstancesPageVue from "pages/InstancesPage.vue";
import TasksPageVue from "src/pages/TasksPage.vue";
import IndexDetailPage from "src/pages/IndexDetailPage.vue";
import KeysPageVue from "src/pages/KeysPage.vue";
import DocumentDetailPage from "src/pages/DocumentDetailPage.vue";
import SimilarDocumentsPage from "src/pages/SimilarDocumentsPage.vue";
import DynamicRulesPage from "src/pages/DynamicRulesPage.vue";

const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: IndexPageVue,
      },
      {
        path: "instances",
        component: InstancesPageVue,
      },
      {
        path: "tasks",
        component: TasksPageVue,
      },
      {
        path: "keys",
        component: KeysPageVue,
      },
      {
        path: "dynamic-rules",
        component: DynamicRulesPage,
      },
      {
        path: "index-details/:uid",
        component: IndexDetailPage,
        props: true,
      },
      {
        path: "documents/:indexUid/:documentUid",
        component: DocumentDetailPage,
        props: true,
      },
      {
        path: "similar/:indexUid/:documentUid",
        component: SimilarDocumentsPage,
        props: true,
      },
    ],
  },
  // Preview mode disabled (alpha feature)
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
