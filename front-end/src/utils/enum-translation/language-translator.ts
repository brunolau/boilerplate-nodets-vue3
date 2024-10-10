import { LANGUAGE } from "../../api/data-contracts/enums";

export default class LanguageTranslator {
    static getString(lang: LANGUAGE) {
        switch (lang) {
            case LANGUAGE.cs:
                return AppState.resources.czech;
            case LANGUAGE.de:
                return AppState.resources.german;
            case LANGUAGE.en:
                return AppState.resources.english;
            case LANGUAGE.it:
                return AppState.resources.italian;
            case LANGUAGE.pl:
                return AppState.resources.polish;
            case LANGUAGE.sk:
                return AppState.resources.slovak;
            case LANGUAGE.hu:
                return AppState.resources.hungary;
            default:
                return "";
        }
    }
}
