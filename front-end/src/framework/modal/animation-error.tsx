import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";

interface ModalAnimationErrorArgs {
    visible: boolean;
}

@Component
class ModalAnimationError extends TsxComponent<ModalAnimationErrorArgs> implements ModalAnimationErrorArgs {
    @Prop() visible!: boolean;

    render(h) {
        if (!this.visible) {
            return null;
        } else {
            return (
                <div class="swal2-icon swal2-error swal2-animate-error-icon" style="display: block;">
                    <span class="swal2-x-mark">
                        <span class="swal2-x-mark-line-left"></span>
                        <span class="swal2-x-mark-line-right"></span>
                    </span>
                </div>
            );
        }
    }
}

export default toNative(ModalAnimationError);
