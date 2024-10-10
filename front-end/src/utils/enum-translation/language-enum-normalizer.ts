import { LANGUAGE } from "../../api/data-contracts/enums";

export default class LanguageEnumNormalizer {
    static getTmrLanguage(lang: Language): LANGUAGE {
        switch (lang) {
            case Language.Slovak:
                return LANGUAGE.sk;
            case Language.English:
                return LANGUAGE.en;
            case Language.Czech:
                return LANGUAGE.cs;
            case Language.German:
                return LANGUAGE.de;
            case Language.Polish:
                return LANGUAGE.pl;
            case Language.Italian:
                return LANGUAGE.it;
            case Language.Hungarian:
                return LANGUAGE.hu;
            default:
                return null;
        }
    }

    static getFrontendLanguage(lang: LANGUAGE): Language {
        switch (lang) {
            case LANGUAGE.sk:
                return Language.Slovak;
            case LANGUAGE.en:
                return Language.English;
            case LANGUAGE.cs:
                return Language.Czech;
            case LANGUAGE.de:
                return Language.German;
            case LANGUAGE.pl:
                return Language.Polish;
            case LANGUAGE.it:
                return Language.Italian;
            case LANGUAGE.hu:
                return Language.Hungarian;
            default:
                return null;
        }
    }
}
