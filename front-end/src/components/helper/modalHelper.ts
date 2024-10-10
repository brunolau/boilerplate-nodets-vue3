export default class ModalHelper {
    static getCancelText(isNew: boolean) {
        if (isNew) {
            return AppState.resources.close;
        } else {
            return AppState.resources.cancel;
        }
    }

    static getConfirmText(isNew: boolean) {
        if (isNew) {
            return AppState.resources.add;
        } else {
            return AppState.resources.save;
        }
    }

    static getConfirmIcon(isNew: boolean) {
        if (isNew) {
            return "fa fa-plus";
        } else {
            return "far fa-save";
        }
    }

    static getEditorSubtitle(updatedBy: string, updatedAt: DateWrapper): string {
        return updatedBy ? AppState.resources.lastUpdate + ": " + updatedBy + " " + updatedAt?.toDisplayStringNonUtc(true, true) : "";
    }
}
