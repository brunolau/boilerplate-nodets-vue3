export default class CountryTranslator {
    static getString(id: number) {
        switch (id) {
            case 1:
                return AppState.resources.czechRepublic;
            case 2:
                return AppState.resources.france;
            case 3:
                return AppState.resources.germany;
            case 4:
                return AppState.resources.poland;
            case 5:
                return AppState.resources.austria;
            case 6:
                return AppState.resources.slovakia;
            case 7:
                return AppState.resources.unitedKingdom;
            case 8:
                return AppState.resources.usa;
            case 9:
                return AppState.resources.italy;
            default:
                return "";
        }
    }
}
