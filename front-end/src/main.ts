import { createApp } from "vue";
import AppEntryComponent from "./framework/app";
import jquery from "jquery";
import moment from "moment";
import select2 from "select2";
import PortalVue from "portal-vue";
import * as BaseResources from "./resources/en.json";
import "bootstrap";
import "./app/scss/styles.scss";
import "./template/scss/style-custom.scss";
import "./template/vendors/mdi/css/materialdesignicons.min.css";
import "animate.css/animate.min.css";
import "sweetalert2/dist/sweetalert2.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "simple-line-icons/css/simple-line-icons.css";
import "weather-icons/css/weather-icons.css";
import "./app/css/custom.css";

//Global window definitions
window["jQuery"] = jquery;
window["$"] = window["jQuery"];
window["moment"] = moment;
window["select2"] = select2();

//TODO: Imports for modules that should be globally available
//Done this way to reduce compile time and decrease bundle sizes
import "./common/api-http";
import "./common/date-wrapper";
import "./common/extensions";
import "./common/ladda-lite";
import "./common/query-string-utils";
import "./common/validation";
import "./common/utils/utils";
import "./common/utils/enums-utils";
import "./common/utils/localized-string";
import "./common/utils/domain-helper";
import "./common/utils/cookie";
import "./common/history-handler";
import "./framework/modal/modal-utils";
import "./app/app-state";
import "./app/router";
import "./app-config";

//Imports for their wrapper-accessors
import "./common/static-wrappers/ladda-lite";
import "./common/static-wrappers/router";
import "./common/static-wrappers/validation";
import { FormItemWrapperConfig } from "./framework/form/form-item-wrapper";
import EsModuleImportHelper from "./common/utils/esmodule-import-helper";
import { TopLevelPagePlugin } from "./framework/app/vue-plugin-toplevelpage";
import "./resources/_LanguageProvider";


if (AppConfig.isDebugMode) {
    // Vue.config.devtools = true

    if (localStorage.getItem("useLiveDataForDebug") == "1") {
        appHttpProvider.enforceDomain = "https://meteo.tmr.sk/api/";
    } else {
        appHttpProvider.enforceDomain = "http://localhost:3001/api/";
    }
} else {
    appHttpProvider.enforceDomain = "/api/";
}

if (portalUtils.isIOS()) {
    let viewport = document.querySelector("meta[name=viewport]");
    viewport.setAttribute("content", viewport.getAttribute("content") + ", maximum-scale=1");
}

appHttpProvider.ajaxDefaults = {
    blockUi: null,
    headers: [
        {
            name: "Accept-Language",
            value: () => {
                return AppState.currentLanguageCode;
            },
        },
    ],
};

FormItemWrapperConfig.labelColumnClass = "col-md-3";
FormItemWrapperConfig.contentColumnClass = "col-md-9";

if (AppState.user != null) {
    appHttpProvider.bearerToken = AppState.user.Token;
}

LanguageProviderAccessor.instance.loadDefaultLanguage(EsModuleImportHelper.getObj(BaseResources));
LanguageProviderAccessor.instance.ensureLanguage().then(() => {
    const app = createApp(AppEntryComponent);
    const router = AppRouterAccessor.instance.currentRouter;
    app.use(router);
    app.use(TopLevelPagePlugin);
    app.use(PortalVue);

    const initApp = () => {
        app.mount("#app");

        if (portalUtils.treatAsMobileDevice()) {
            let loaderContainer = $(".mobileLoader");
            loaderContainer.addClass("mobileLoaderActive").html(AppConfig.blockerHtml);
        }
    };

    if ((window as any).appAutoInit == false) {
        (window as any).initApp = initApp;
    } else {
        if (AppConfig.isDebugMode) {
            setTimeout(() => {
                initApp();
            }, 1500);
        } else {
            initApp();
        }
    }
});
