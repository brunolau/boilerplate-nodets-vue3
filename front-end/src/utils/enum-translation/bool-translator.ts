export default class BoolTranslator {
    static getString(val: boolean): string {
        if (val == true) {
            return AppState.resources.yes;
        }

        return AppState.resources.no;
    }
}
