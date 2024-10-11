(function () {
    let resCache: any = {};
    let failedDownloads: any = {};
    let fallbackLanguage = Language.English;

    async function loadLanguage(language: Language): Promise<boolean> {
        var resPack: IAppResources;
        if (language == Language.Slovak) {
            try {
                resPack = getImportedObj((await import("./sk.json")) as any);
                resCache[language] = resPack;
            } catch (e) {
                failedDownloads[language] = true;
            }
        } else if (language == Language.English) {
            try {
                resPack = getImportedObj((await import("./en.json")) as any);
                resCache[language] = resPack;
            } catch (e) {
                failedDownloads[language] = true;
            }
        }

        // } else if (language == Language.Czech) {
        //     try {
        //         resPack = getImportedObj(await import('./cs.json') as any);
        //         resCache[language] = resPack;
        //     } catch (e) {
        //         failedDownloads[language] = true;
        //     }
        // }

        return true;
    }

    function getImportedObj(importedObj: any): any {
        if (importedObj != null && importedObj.__esModule == true) {
            return { ...importedObj.default };
        }

        return { ...importedObj };
    }

    function needsReload(): boolean {
        return resCache[AppState.currentLanguageCode] == null;
    }

    function postProcessLanguage(language: Language): void {
        if (resCache[language] != null) {
            var langPack = resCache[language];
            var defLanguage = resCache[fallbackLanguage];

            for (var key in defLanguage) {
                if (langPack[key] == null) {
                    langPack[key] = defLanguage[key];
                }
            }
        }
    }

    class LanguageProviderImpl implements ILanguageProvider {
        public async ensureLanguage(): Promise<boolean> {
            var promiseArr: Promise<boolean>[] = [];
            var currentLanguage = AppState.currentLanguage;

            if (resCache[fallbackLanguage] == null) {
                promiseArr.push(loadLanguage(fallbackLanguage));
            }

            if (currentLanguage != fallbackLanguage && failedDownloads[currentLanguage] != true && needsReload()) {
                promiseArr.push(loadLanguage(currentLanguage));
            }

            if (promiseArr.length > 0) {
                await Promise.all(promiseArr);
                if (currentLanguage != fallbackLanguage) {
                    postProcessLanguage(currentLanguage);
                }
            }

            return true;
        }

        public getResourcePack(language: Language): IAppResources {
            var retVal = resCache[language];
            if (retVal == null) {
                retVal = resCache[fallbackLanguage];
            }

            return retVal;
        }

        public loadDefaultLanguage(resPack): void {
            resCache[fallbackLanguage] = resPack;
        }
    }

    window["LanguageProvider"] = new LanguageProviderImpl();
})();

interface ILanguageProvider {
    ensureLanguage(): Promise<boolean>;
    getResourcePack(language: Language): IAppResources;
    loadDefaultLanguage(resPack): void;
}

class LanguageProviderAccessor {
    static get instance(): ILanguageProvider {
        return window["LanguageProvider"];
    }
}

window["LanguageProviderAccessor"] = LanguageProviderAccessor;
