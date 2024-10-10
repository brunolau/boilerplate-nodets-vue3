import { LANGUAGE } from "../api/data-contracts/enums";
import LocalizedText from "../api/data-contracts/localized-text";
import LanguageEnumNormalizer from "./enum-translation/language-enum-normalizer";

export default class LocalizedValueHelper {
    static getLocalizedValue(value: LocalizedText): string {
        if (value == null) {
            return null;
        }

        const lang = LanguageEnumNormalizer.getTmrLanguage(AppState.currentLanguage);
        const inLang = value[lang];

        if (inLang != null) {
            return inLang;
        }

        if (lang == LANGUAGE.cs) {
            const fbLang = value[LANGUAGE.sk];
            if (fbLang != null) {
                return fbLang;
            }
        }

        if (lang == LANGUAGE.sk) {
            const fbLang = value[LANGUAGE.cs];
            if (fbLang != null) {
                return fbLang;
            }
        }

        const enVal = value[LANGUAGE.en];
        if (enVal != null) {
            return enVal;
        }

        for (const propKey in value) {
            return value[propKey];
        }
    }

    static validateLocalizedValue(locValArr: LocalizedText): boolean {
        if (isNullOrEmpty(LocalizedValueHelper.getLocalizedValue(locValArr))) {
            return false;
        }

        return true;
    }
}
