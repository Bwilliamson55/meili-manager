/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

import { configure } from "quasar/wrappers";

const APP_NAME = "Meili Manager";
const APP_DESCRIPTION =
  "A Quasar app to manage multiple Meilisearch instances";

const manifestIcons = [
  {
    src: "icons/icon-192x192.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "icons/icon-512x512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "icons/maskable-icon-192x192.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "maskable",
  },
  {
    src: "icons/maskable-icon-512x512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "maskable",
  },
];

export default configure(function (ctx) {
  return {
    eslint: {
      // fix: true,
      // include = [],
      // exclude = [],
      // rawOptions = {},
      warnings: true,
      errors: true,
    },

    // https://v2.quasar.dev/quasar-cli/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli/boot-files
    boot: ["theme", "umami", "instant-search"],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
    css: ["tailwind.css", "app.scss"],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // IBM Plex Sans is loaded via Google Fonts in app.scss (no roboto-font).
      "material-icons",
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
    build: {
      // Align with supported browsers for Vite 6+/Quasar 2; avoids esbuild
      // "destructuring in async" downlevel failures from legacy chrome87 caps.
      target: {
        browser: ["es2022", "chrome100", "firefox100", "safari15"],
        node: "node18",
      },

      vueRouterMode: "hash", // available values: 'hash', 'history'
      // vueRouterBase,
      // vueDevtools,
      // vueOptionsAPI: false,

      // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

      // publicPath: '/',
      // analyze: true,
      // env: {},
      // rawDefine: {}
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      distDir: ctx.mode.pwa ? "dist/pwa" : "dist/spa",

      // extendViteConf (viteConf) {},
      // viteVuePluginOptions: {},

      // vitePlugins: [
      //   [ 'package-name', { ..options.. } ]
      // ]
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
    devServer: {
      // https: true
      open: true, // opens browser window automatically
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
    framework: {
      config: {
        // Build-time defaults match weeumson-dark; runtime applyTheme setCssVar owns live brand.
        brand: {
          primary: "#b85538",
          secondary: "#8a9480",
          accent: "#b8956c",
          dark: "#232019",
          "dark-page": "#1a1714",
          positive: "#7a9a70",
          negative: "#d46a5c",
          info: "#7a9eb0",
          warning: "#d4a05a",
        },
      },

      plugins: ["Notify", "Dark", "Dialog", "Loading"],
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: [],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#property-sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/App.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   registerServiceWorker: 'src-pwa/register-service-worker',
    //   serviceWorker: 'src-pwa/custom-service-worker',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   electronMain: 'src-electron/electron-main',
    //   electronPreload: 'src-electron/electron-preload'
    // },

    // https://v2.quasar.dev/quasar-cli/developing-ssr/configuring-ssr
    ssr: {
      // ssrPwaHtmlFilename: 'offline.html', // do NOT use index.html as name!
      // will mess up SSR

      // extendSSRWebserverConf (esbuildConf) {},
      // extendPackageJson (json) {},

      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      middlewares: [
        "render", // keep this as last one
      ],
    },

    // https://v2.quasar.dev/quasar-cli/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: "InjectManifest",
      injectPwaMetaTags({ publicPath, pwaManifest }) {
        const theme = pwaManifest.theme_color ?? "#b85538";
        return (
          `<meta name="theme-color" content="${theme}">` +
          '<meta name="mobile-web-app-capable" content="yes">' +
          '<meta name="apple-mobile-web-app-status-bar-style" content="default">' +
          `<meta name="apple-mobile-web-app-title" content="${APP_NAME}">` +
          '<meta name="msapplication-TileColor" content="#1a1714">' +
          `<link rel="apple-touch-icon" href="${publicPath}icons/apple-touch-icon.png">`
        );
      },
      swFilename: "sw.js",
      manifestFilename: "manifest.json",
      useCredentialsForManifestTag: false,
      // useFilenameHashes: true,
      // extendGenerateSWOptions (cfg) {}
      // extendInjectManifestOptions (cfg) {},
      // extendPWACustomSWConf (esbuildConf) {}
      manifest: {
        name: APP_NAME,
        short_name: APP_NAME,
        description: APP_DESCRIPTION,
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "any",
        background_color: "#1a1714",
        theme_color: "#b85538",
        icons: manifestIcons,
      },
      extendManifestJson(manifest) {
        Object.assign(manifest, {
          name: APP_NAME,
          short_name: APP_NAME,
          description: APP_DESCRIPTION,
          background_color: "#1a1714",
          theme_color: "#b85538",
          icons: manifestIcons,
        });
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
    electron: {
      // extendElectronMainConf (esbuildConf)
      // extendElectronPreloadConf (esbuildConf)

      inspectPort: 5858,

      bundler: "packager", // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: "meili-manager",
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      contentScripts: ["my-content-script"],

      // extendBexScriptsConf (esbuildConf) {}
      // extendBexManifestJson (json) {}
    },
  };
});
