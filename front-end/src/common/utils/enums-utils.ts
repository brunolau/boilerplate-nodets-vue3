namespace LanguageUtils {
    export interface LanguageListItem {
        text: string;
        value: string;
        flag: string;
        id: Language;
    }

    function getAdjectiveName(name: string): string {
        if (name.endsWith("ý")) {
            name = name.substring(0, name.length - 1) + "y";
        }

        return name;
    }

    export function getLanguageList(): Array<LanguageListItem> {
        let retVal = <Array<LanguageListItem>>[];

        const getLanguage = (langId: number): LanguageListItem => {
            let newOption = <LanguageListItem>{
                id: langId,
                text: getAdjectiveName(AppState.resources["language" + langId]),
                value: langId.toString(),
                flag: null,
            };

            switch (langId) {
                case 0:
                    newOption.flag = "svk";
                    break;
                case 1:
                    newOption.flag = "gbr";
                    break;
                case 2:
                    newOption.flag = "cze";
                    break;
                case 3:
                    newOption.flag = "ger";
                    break;
                case 4:
                    newOption.flag = "lat";
                    break;
                case 5:
                    newOption.flag = "pol";
                    break;
                case 6:
                    newOption.flag = "ita";
                    break;
                case 7:
                    newOption.flag = "hun";
                    break;
                default:
                    break;
            }

            return newOption;
        };

        //client want this exact order
        retVal.push(...[getLanguage(1), getLanguage(0), getLanguage(3), getLanguage(2), getLanguage(5), getLanguage(6), getLanguage(7)]);

        try {
            // retVal.sort(function (a, b) {
            //     return a.text.localeCompare(b.text);
            // });
        } catch (e) {
            // retVal.sortBy('text');
        }

        LanguageUtils.getLanguageList = function () {
            return retVal;
        };
        return retVal;
    }
    export function getLanguageCode(langEnum: Language): string {
        switch (langEnum) {
            case Language.Slovak:
                return "sk";
            case Language.English:
                return "en";
            case Language.Czech:
                return "cs";
            case Language.German:
                return "de";
            case Language.Latvian:
                return "lv";
            case Language.Polish:
                return "pl";
            case Language.Italian:
                return "it";
            case Language.Hungarian:
                return "hu";
            default:
                return null;
        }
    }
    export function getLocalizedStringProperty(langEnum: Language): string {
        switch (langEnum) {
            case Language.Slovak:
                return "Slovak";
            case Language.English:
                return "English";
            case Language.Czech:
                return "Czech";
            case Language.German:
                return "German";
            case Language.Latvian:
                return "Latvian";
            case Language.Polish:
                return "Polish";
            case Language.Italian:
                return "Italian";
            case Language.Hungarian:
                return "Hungarian";
            default:
                return null;
        }
    }

    export function getLocalizedStringLanguageByPropertyName(propName: string): Language {
        switch (propName) {
            case "Slovak":
                return Language.Slovak;
            case "Czech":
                return Language.Czech;
            case "English":
                return Language.English;
            case "German":
                return Language.German;
            case "Latvian":
                return Language.Latvian;
            case "Polish":
                return Language.Polish;
            case "Italian":
                return Language.Italian;
            case "Hungarian":
                return Language.Hungarian;
            default:
                return null;
        }
    }

    /**
     * Returns enum value from string language code
     *
     * @param langCode 2-letter language code [sk, en, cs...]
     */
    export function getLanguageEnum(langCode: string): number {
        if (langCode == "sk") {
            return Language.Slovak;
        } else if (langCode == "cs") {
            return Language.Czech;
        } else if (langCode == "de") {
            return Language.German;
        } else if (langCode == "pl") {
            return Language.Polish;
        } else if (langCode == "lv") {
            return Language.Latvian;
        } else if (langCode == "it") {
            return Language.Italian;
        } else if (langCode == "hu") {
            return Language.Hungarian;
        } else {
            return Language.English; //Default EN
        }
    }

    export function getLanguageFlagUrl(languageFlag: string, svg?: boolean): string {
        if (!svg) {
            return AppConfig.cdnPath + "/assets/img/flags/" + languageFlag + ".png";
        } else {
            return AppConfig.cdnPath + "/assets/img/flags/svg/" + languageFlag + ".svg";
        }
    }

    export function floatToCurrency(value: number, currency: string | Currency | number | any): string {
        var currencyISO: string;
        if (currency == null || currency == "") {
            currencyISO = "?";
        } else if (portalUtils.isNumber(currency)) {
            switch (Number(currency)) {
                case Currency.EUR:
                    currencyISO = "EUR";
                    break;
                case Currency.CZK:
                    currencyISO = "CZK";
                    break;
                case Currency.GBP:
                    currencyISO = "GBP";
                    break;
                case Currency.HUF:
                    currencyISO = "HUF";
                    break;
                case Currency.PLN:
                    currencyISO = "PLN";
                    break;
                case Currency.RUB:
                    currencyISO = "RUB";
                    break;
                case Currency.USD:
                    currencyISO = "USD";
                    break;
                default:
                    currencyISO = "?";
            }
        } else {
            currencyISO = currency as any;
        }

        try {
            return (Math.round(value * 100) / 100).toLocaleString(AppState.currentLanguageCode, {
                style: "currency",
                currency: currencyISO,
            });
        } catch (e) {
            return (Math.round(value * 100) / 100).toString() + " " + currencyISO;
        }
    }

    export function negateString(str: string): string {
        return AppState.resources.negationBase + str.toLowerCase();
    }
}

window["LanguageUtils"] = LanguageUtils;
