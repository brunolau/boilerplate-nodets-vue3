export default class ActiveTranslator {
    static getString(val: boolean) {
        if (val) {
            return AppState.resources.active;
        } else {
            return AppState.resources.inactive;
        }
    }
}
