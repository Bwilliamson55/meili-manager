import vue from "eslint-plugin-vue";
import prettier from "eslint-config-prettier";

const appGlobals = {
  ga: "readonly",
  cordova: "readonly",
  __statics: "readonly",
  __QUASAR_SSR__: "readonly",
  __QUASAR_SSR_SERVER__: "readonly",
  __QUASAR_SSR_CLIENT__: "readonly",
  __QUASAR_SSR_PWA__: "readonly",
  process: "readonly",
  Capacitor: "readonly",
  chrome: "readonly",
  defineProps: "readonly",
  defineEmits: "readonly",
  defineExpose: "readonly",
  withDefaults: "readonly",
};

export default [
  {
    ignores: [
      "dist/**",
      "src-capacitor/**",
      "src-cordova/**",
      ".quasar/**",
      "node_modules/**",
      ".eslintrc.js",
      "**/*.cjs",
    ],
  },
  ...vue.configs["flat/essential"],
  prettier,
  {
    files: ["**/*.{js,vue}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: appGlobals,
    },
    rules: {
      "prefer-promise-reject-errors": "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
      "vue/no-mutating-props": "off",
      "vue/valid-template-root": "off",
      "vue/no-unused-vars": "off",
    },
  },
];
