import { Modal as BootstrapModal } from "bootstrap";

interface ModalDisplayArgs<T> {
    modal: BootstrapModal;
    data?: T;
    onHidden?: (response: ModalResponseData<T>) => void;
    onShown?: (e: ModalOnShownArgs) => void;
    onBeforeShown?: (e: ModalOnBeforeShownArgs) => void;
}

interface ModalHideArgs {
    modal: BootstrapModal;
}

interface ModalResponseData<T> {
    data?: T;
}

export interface ModalOnBeforeShownArgs {
    instance: IVue;
}

export interface ModalOnShownArgs {
    instance: IVue;
}

export class ModalUtils {
    static showModal<T>(instance: IVue, dataArgs: ModalDisplayArgs<T> | IVue | Element): void {
        var args: ModalDisplayArgs<T> = dataArgs as any;
        if (args.modal == null) {
            args = { modal: args as any } as ModalDisplayArgs<T>;
        }

        var modalContext = args.modal;
        if (modalContext == null) {
            console.error("Modal context not specified");
            return;
        }

        instance.$nextTick(() => {
            var modalSelector = this._getModalJquery(modalContext["_element"]);
            modalSelector.off("hidden.bs.modal");
            modalSelector.off("shown.bs.modal");

            if (args.onHidden != null) {
                modalSelector.on("hidden.bs.modal", function () {
                    args.onHidden({
                        data: args.data,
                    });
                });
            }

            if (args.onShown != null) {
                modalSelector.on("shown.bs.modal", function () {
                    args.onShown({
                        instance: instance,
                    });
                });
            }

            if (args.onBeforeShown != null) {
                args.onBeforeShown({
                    instance: instance,
                });
            }

            args.modal.show();
        });
    }

    static hideModal(dataArgs: ModalHideArgs | IVue | Element): void {
        var args: ModalHideArgs = dataArgs as any;
        if (args.modal == null) {
            args = { modal: args as any } as ModalHideArgs;
        }

        var modalContext = args.modal;
        if (modalContext == null) {
            console.error("Modal context not found");
            return;
        }

        setTimeout(() => {
            args.modal.hide();
        }, 1);
    }

    private static _getModalJquery(modalElem: Element | IVue): JQuery {
        return window["jQuery"](modalElem as any);
    }
}
