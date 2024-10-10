interface BootstrapModalDisplayArgs<T> {
    id: string;
    data?: T;
    onHidden?: (response: BootstrapModalResponseData<T>) => void;
    onShown?: (response: BootstrapModalResponseData<T>) => void;
}

interface BootstrapModalHideArgs {
    id: string;
}

interface BootstrapModalResponseData<T> {
    data?: T;
}

export class BootstrapModal {
    static show<T>(args: BootstrapModalDisplayArgs<T>): void {
        setTimeout(() => {
            var modalSelector = this._getModalSelector(args.id);
            modalSelector.unbind("hidden.bs.modal");
            modalSelector.unbind("shown.bs.modal");

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
                        data: args.data,
                    });
                });
            }

            modalSelector.show();
        }, 1);
    }

    static hide(args: BootstrapModalHideArgs): void {
        setTimeout(() => {
            this._getModalSelector(args.id).hide();
        }, 1);
    }

    private static _getModalSelector(id: string): JQuery {
        return window["jQuery"]("#" + id);
    }
}
