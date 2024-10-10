import { ModalSize } from "../../framework/modal/modal";

export default class TmrModalHelper {
    static getSize(): ModalSize {
        if (AppState.modalSectionMode == ModalSectionMode.fieldSet) {
            return ModalSize.Large;
        } else {
            return ModalSize.ExtraLarge;
        }
    }
}
