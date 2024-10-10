class AppConfig {
    static _fullBlockerHtml = document.querySelector(".loading-full-overlay").outerHTML;
    static GOOGLE_API_KEY: string = "AIzaSyCuT0CmRvpuYt5blvh_7Qdkx2pxA3OI67I";
    static GEONAMES_USERNAME: string = "tmr";

    static get isDebugMode(): boolean {
        return location.href.indexOf("localhost") > -1;
    }

    static get cdnPath(): string {
        if (AppConfig.isDebugMode) {
            return "";
        }

        return window["resourceCdnPath"] || "";
    }

    static get onBootstrapStyle(): "primary" | "info" {
        return "primary";
    }

    static get logoPathSquare(): string {
        return AppConfig.cdnPath + "/assets/img/logo_i.png";
    }

    static get logoPathRectangle(): string {
        return AppConfig.cdnPath + "/assets/img/inviton-white-text-only.png";
    }

    static get breadcrumbEnabled(): boolean {
        return true;
    }

    static get blockerHtml(): string {
        return '<div class="holdon-white holdon-overlay holdon-element"><div class="holdon-content"><div class="sk-rect"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div></div></div>';
    }

    static get intransparentBlockerHtml(): string {
        return AppConfig._fullBlockerHtml;
    }

    static get blockerSelector(): string {
        return ".holdon-overlay";
    }

    static get rootDynamicComponentContainer(): IDynamicComponentContainer {
        return window["RootDynamicContainerInstance"];
    }

    static get supportedLanguages(): Language[] {
        return [Language.Slovak, Language.English, Language.German, Language.Polish, Language.Czech, Language.Italian];
    }

    static parseErrorMessage(respText: string): string {
        let parsedErr: any;
        if (respText == null || respText.indexOf("{") != 0) {
            return respText;
        }

        try {
            parsedErr = JSON.parse(respText);
        } catch (error) {
            parsedErr = respText as any;
        }

        if (!isNullOrEmpty(parsedErr?.messages)) {
            let msgBuilder = "";
            parsedErr.messages.forEach((msgData) => {
                if (!isNullOrEmpty(msgData.message)) {
                    if (msgBuilder.length > 0) {
                        msgBuilder += "\n\n";
                    }

                    msgBuilder += msgData.message;
                }
            });

            return msgBuilder;
        }

        return null;
    }
}

(function () {
    window["AppConfig"] = AppConfig;
})();
