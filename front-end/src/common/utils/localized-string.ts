interface ILocalizedString {
    Slovak: string;
    English: string;
    Czech: string;
    German: string;
    Latvian: string;
    Polish: string;
    Italian: string;
    Hungarian: string;
}

namespace LocalizedStringHelper {
    function isNullOrEmpty(str: string) {
        return str == null || str.length == 0;
    }

    export function getValue(localizedString: ILocalizedString, lang: Language | string) {
        var langEnum: Language;

        if (localizedString == null) {
            return null;
        }

        if (typeof lang === "string" || <any>lang instanceof String) {
            langEnum = LanguageUtils.getLanguageEnum(<string>lang);
        } else {
            langEnum = lang;
        }

        if (langEnum == Language.Slovak) {
            if (!isNullOrEmpty(localizedString.Slovak)) {
                return localizedString.Slovak;
            } else if (!isNullOrEmpty(localizedString.Czech)) {
                return localizedString.Czech;
            }
        } else if (langEnum == Language.Czech) {
            if (!isNullOrEmpty(localizedString.Czech)) {
                return localizedString.Czech;
            } else if (!isNullOrEmpty(localizedString.Slovak)) {
                return localizedString.Slovak;
            }
        } else if (langEnum == Language.German) {
            if (!isNullOrEmpty(localizedString.German)) {
                return localizedString.German;
            }
        } else if (langEnum == Language.Latvian) {
            if (!isNullOrEmpty(localizedString.Latvian)) {
                return localizedString.Latvian;
            }
        } else if (langEnum == Language.Polish) {
            if (!isNullOrEmpty(localizedString.Polish)) {
                return localizedString.Polish;
            }
        } else if (langEnum == Language.Italian) {
            if (!isNullOrEmpty(localizedString.Italian)) {
                return localizedString.Italian;
            }
        } else if (langEnum == Language.Hungarian) {
            if (!isNullOrEmpty(localizedString.Hungarian)) {
                return localizedString.Hungarian;
            }
        }

        //If nothing returned up until now, return anything
        if (!isNullOrEmpty(localizedString.English)) {
            return localizedString.English;
        }

        if (!isNullOrEmpty(localizedString.German)) {
            return localizedString.German;
        }

        if (!isNullOrEmpty(localizedString.Slovak)) {
            return localizedString.Slovak;
        }

        if (!isNullOrEmpty(localizedString.Czech)) {
            return localizedString.Czech;
        }

        if (!isNullOrEmpty(localizedString.Polish)) {
            return localizedString.Polish;
        }

        if (!isNullOrEmpty(localizedString.Latvian)) {
            return localizedString.Latvian;
        }

        if (!isNullOrEmpty(localizedString.Hungarian)) {
            return localizedString.Hungarian;
        }

        return null;
    }
}

window["LocalizedStringHelper"] = LocalizedStringHelper;
