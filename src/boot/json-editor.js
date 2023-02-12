import { boot } from "quasar/wrappers";
import vue3TsJsoneditor from "vue3-ts-jsoneditor";

export default boot(({ app }) => {
  app.use(vue3TsJsoneditor);
});
