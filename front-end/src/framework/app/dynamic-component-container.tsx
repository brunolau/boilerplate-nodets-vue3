import { Vue } from "vue-facing-decorator";
import { toNative } from "vue-facing-decorator";
import { DialogUtils } from "../../common/dialog-utils";
import { Component } from "../../app/vuetsx";

declare global {
    export interface IDynamicComponentContainer {
        getInstance<T>(uuid: string): T;
        addInstance(uuid: string, componentConstructor: any): void;
        showLazyLoadedModal(args: DynamicComponentLazyLoadedModalArgs): Promise<any>;
    }

    export interface DynamicComponentLazyLoadedModalArgs {
        cacheId: string;
        args: any;
        title: string;
        modalSize: string;
        moduleImport?: Promise<any>;
    }
}

@Component
class DynamicComponentContainer extends Vue implements IDynamicComponentContainer {
    private vueTsxProps: Readonly<{ ref?: string }>;
    private instanceCache: { [uuid: string]: any } = {};

    created() {
        this.instanceCache = {};
    }

    getInstance<T>(uuid: string): T {
        return this.instanceCache[uuid] as T;
    }

    addInstance(uuid: string, componentConstructor: any) {
        var instance = new componentConstructor();
        instance.$mount();
        (this.$refs.componentContainer as HTMLElement).appendChild(instance.$el);
        this.instanceCache[uuid] = instance;
    }

    async showLazyLoadedModal(args: DynamicComponentLazyLoadedModalArgs): Promise<any> {
        let dataArgs = args.args || {};
        let instance = AppConfig.rootDynamicComponentContainer.getInstance(args.cacheId) as any;
        let onBeforeShown = dataArgs.onBeforeShown;
        let onShown = dataArgs.onShown;

        if (instance == null) {
            let dialog = await DialogUtils.showDialogEx({
                buttons: [],
                title: args.title,
                message: "",
                size: args.modalSize as any,
            });

            dialog.showLoading();

            setTimeout(async () => {
                dataArgs.onBeforeShown = (e) => {
                    $(e.instance.$refs.modalRoot).removeClass("fade");

                    if (onBeforeShown != null) {
                        onBeforeShown(e);
                    }
                };

                dataArgs.onShown = (e) => {
                    dialog.modalContext.css("visibility", "hidden");
                    $(".modal-backdrop.fade.show").last().css("visibility", "hidden");

                    setTimeout(() => {
                        //
                        dialog.hideModal();
                        $(".modal-backdrop").addClass("fade");
                        $(e.instance.$refs.modalRoot).addClass("fade");
                    }, 10);

                    if (onShown != null) {
                        onShown(e);
                    }
                };

                let importResult = await args.moduleImport;
                AppConfig.rootDynamicComponentContainer.addInstance(args.cacheId, importResult.default);
                instance = AppConfig.rootDynamicComponentContainer.getInstance(args.cacheId);

                this.$nextTick(() => {
                    instance.show(dataArgs);
                });
            }, 500);
        } else {
            instance.show(dataArgs);
        }
    }

    render(h) {
        return <div ref="componentContainer"></div>;
    }
}

export default toNative(DynamicComponentContainer);
