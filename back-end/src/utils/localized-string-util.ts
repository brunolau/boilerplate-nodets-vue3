import { LANGUAGE } from "src/data/data-contracts/enums";
import LocalizedText from "src/data/data-contracts/localized-text";

interface ILocalizedString {
    Slovak: string;
    English: string;
    Czech: string;
    German: string;
    Latvian: string;
    Polish: string;
    Italian: string;
}


export default class LocalizedStringUtil {
    /**
     * Get localized text value
     * @param value LocalizedText object
     * @param langKey Language, in which the text should be returned
     * @returns Localized text value
     */
    static getLocalizedTextValue(value: LocalizedText, langKey: string | LANGUAGE): string {
        if (value == null) {
            return null;
        }

        let retVal = (value as any)[langKey];
        if (retVal != null) {
            return retVal;
        }

        if (langKey == 'sk') {
            retVal = value.cs;
        } else if (langKey == 'cs') {
            retVal = value.sk
        } else {
            retVal = value.en;
        }

        if (retVal != null) {
            return retVal;
        }

        if (value.sk != null) {
            return value.sk;
        }

        return LocalizedStringUtil.getLocalizedStringValue(value as any, langKey);
    }

    /**
     * Get localized string value, fallback for incorrect data types
     * @param value ILocalizedString object
     * @param langKey Language, in which the text should be returned
     * @returns Localized string value
     */
    private static getLocalizedStringValue(value: ILocalizedString, langKey: string | LANGUAGE): string {
        if (value == null) {
            return null;
        }

        const key = this.stringLangKeyTranslator(langKey);

        let retVal = (value as any)[key];
        if (retVal == null) {
            if (langKey == 'sk') {
                retVal = value.Czech;
            } else if (langKey == 'cs') {
                retVal = value.Slovak
            } else {
                retVal = value.English;
            }
        }

        if (retVal == null) {
            if (value.Slovak != null) {
                return value.Slovak;
            }

            for (const propName in value) {
                const text = (value as any)[propName];
                if (text != null && text.toString().length > 0) {
                    return text;
                }

            }
        }

        return retVal || value.Slovak;
    }

    /**
     * Translate language key to ILocalizedString format
     * @param langKey Language key in different format than ILocalizedString supports
     * @returns Language key in ILocalizedString format
     */
    private static stringLangKeyTranslator(langKey: string | LANGUAGE): string {
        switch (langKey) {
            case LANGUAGE.sk:
                return 'Slovak';
            case LANGUAGE.cs:
                return 'Czech';
            case LANGUAGE.en:
                return 'English';
            case LANGUAGE.pl:
                return 'Polish';
            case LANGUAGE.de:
                return 'German';
            default:
                return langKey;
        }
    }
}
