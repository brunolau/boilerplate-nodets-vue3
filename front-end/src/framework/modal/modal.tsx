import { Prop, toNative } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import ModalIconWarning from "./icon-warning";
import ModalAnimationSuccess from "./animation-success";
import ModalAnimationError from "./animation-error";
import LoadingIndicator from "../loading-indicator";
import { Portal } from "portal-vue";
import { Modal as BootstrapModal } from "bootstrap";
import { ModalOnBeforeShownArgs, ModalOnShownArgs, ModalUtils } from "./modal-utils";

interface ModalArgs {
    title: string;
    size?: ModalSize;
    icon?: ModalHeaderIcon;
    blocked?: boolean;
    cssClass?: string;
    dismissable?: boolean;
    backdropStatic?: boolean;
    mobileFullscreen?: boolean;
    modalLazyMode?: boolean;
    preventHistoryEntry?: boolean;
    alternativePortal?: boolean;
}

export const enum ModalSize {
    Normal = 0,
    Small = 1,
    Large = 2,
    ExtraLarge = 3,
    FullWidth = 4,
    NormalToLarge = 5,
}

export const enum ModalHeaderIcon {
    Success = 0,
    Error = 1,
    Warning = 2,
    Question = 3,
}

declare global {
    export interface ModalShowArgs {
        onHidden?: () => void;
        onShown?: (e: ModalOnShownArgs) => void;
        onBeforeShown?: (e: ModalOnBeforeShownArgs) => void;
    }
}

@Component({
    components: {
        portal: Portal,
    },
})
class Modal extends TsxComponent<ModalArgs> implements ModalArgs {
    @Prop() title!: string;
    @Prop() size!: ModalSize;
    @Prop() icon!: ModalHeaderIcon;
    @Prop() blocked!: boolean;
    @Prop() cssClass!: string;
    @Prop() dismissable: boolean;
    @Prop() backdropStatic!: boolean;
    @Prop() mobileFullscreen: boolean;
    @Prop() modalLazyMode: boolean;
    @Prop() preventHistoryEntry: boolean;
    @Prop() alternativePortal: boolean;
    uuid: string = null;
    modalShown: boolean = false;

    mounted() {
        this.uuid = portalUtils.randomString(6);
    }

    private getFullId(): string {
        return "modal-" + "-" + this.uuid;
    }

    private getLabelId(): string {
        return this.getFullId() + "label";
    }

    private getModalSizeCss(): string {
        if (this.size == ModalSize.Large) {
            return " modal-lg";
        } else if (this.size == ModalSize.Small) {
            return " modal-sm";
        } else if (this.size == ModalSize.ExtraLarge) {
            return " modal-xl";
        } else if (this.size == ModalSize.FullWidth) {
            return " modal-fw";
        } else if (this.size == ModalSize.NormalToLarge) {
            return " modal-ntl";
        } else {
            return "";
        }
    }

    getModalInstance(): BootstrapModal {
        return BootstrapModal.getOrCreateInstance(this.$refs.modalRoot as Element);
    }

    public show(args?: ModalShowArgs) {
        args = args || {};
        this.modalShown = true;
        this.$nextTick(() => {
            ModalUtils.showModal(this, {
                modal: this.getModalInstance(),
                onShown: args.onShown,
                onHidden: args.onHidden,
                onBeforeShown: args.onBeforeShown,
            });
        });
    }

    public hide() {
        ModalUtils.hideModal({
            modal: this.getModalInstance(),
        });
    }

    render() {
        let nonStaticBackdrop = this.backdropStatic != true && this.dismissable != false;
        if (!this.modalShown && this.modalLazyMode != false) {
            return null;
        }

        return (
            <portal to={this.alternativePortal ? "bs-modal-container-alt" : "bs-modal-container"}>
                <div
                    id={this.getFullId()}
                    key={this.getFullId()}
                    ref="modalRoot"
                    class={"modal fade " + (this.mobileFullscreen ? "mobile-fullscreen " : "") + (this.cssClass || "")}
                    role="dialog"
                    aria-labelledby={this.getLabelId()}
                    aria-hidden="true"
                    data-bs-backdrop={nonStaticBackdrop ? "true" : "static"}
                    data-bs-keyboard={nonStaticBackdrop}
                    data-bs-preventhistory={this.preventHistoryEntry == true ? "true" : null}
                >
                    <div class={"modal-dialog" + this.getModalSizeCss()} role="document">
                        <div class="modal-content">
                            <LoadingIndicator visible={this.blocked} />
                            <div class={"modal-header" + (this.icon == null ? "" : " modal-has-headericon")}>
                                {this.icon != null && <div class="modal-header-icon">{this.renderModalHeaderIcon()}</div>}

                                <h5 class="modal-title" id={this.getLabelId()}>
                                    {this.title}
                                </h5>

                                {this.dismissable != false && <button type="button" class="btn-close close" tabindex="-1" data-bs-dismiss="modal" aria-label={AppState.resources.close}></button>}
                            </div>

                            {this.$slots.default?.()}
                        </div>
                    </div>
                </div>
            </portal>
        );
    }

    renderModalHeaderIcon() {
        if (this.icon == ModalHeaderIcon.Warning) {
            return <ModalIconWarning visible={true} />;
        } else if (this.icon == ModalHeaderIcon.Success) {
            return <ModalAnimationSuccess visible={true} />;
        } else if (this.icon == ModalHeaderIcon.Error) {
            return <ModalAnimationError visible={true} />;
        } else if (this.icon == ModalHeaderIcon.Question) {
            return <ModalIconWarning visible={true} />;
        }

        return null;
    }
}

export default toNative(Modal);
