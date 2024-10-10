import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vueJsx({
            babelPlugins: [["@babel/plugin-proposal-decorators", { legacy: true }], ["@babel/plugin-transform-flow-strip-types"], ["@babel/plugin-proposal-class-properties", { loose: true }]],
        }),
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
            "~bootstrap": path.resolve(__dirname, "node_modules/bootstrap"),
        },
    },
    server: {
        host: "localhost",
        port: 9345,
    },
    css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true,
            },
        },
    },
    define: {
        "Language.Slovak": 0,
        "Language.English": 1,
        "Language.Czech": 2,
        "Language.German": 3,
        "Language.Latvian": 4,
        "Language.Polish": 5,
        "Language.Italian": 6,
        "Language.Hungarian": 7,

        "Currency.EUR ": 978,
        "Currency.CZK ": 203,
        "Currency.GBP ": 826,
        "Currency.HUF ": 348,
        "Currency.PLN ": 985,
        "Currency.RUB ": 643,
        "Currency.USD ": 840,
        "Currency.Undefined": -1,
        "Currency.Multiple": -2,

        "TryCallApiResult.Success": 0,
        "TryCallApiResult.Error": 1,

        "ModalSectionMode.fieldSet": 0,
        "ModalSectionMode.navPills": 1,

        "AppMenuType.MenuItem": 0,
        "AppMenuType.Separator": 1,
    },
});
