import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";

interface ModalAnimationSuccessArgs {
    visible: boolean;
}

@Component
class ModalAnimationSuccess extends TsxComponent<ModalAnimationSuccessArgs> implements ModalAnimationSuccessArgs {
    @Prop() visible!: boolean;

    render(h) {
        if (!this.visible) {
            return null;
        } else {
            return (
                <div class="swal2-icon swal2-success swal2-animate-success-icon" style="display: block;">
                    <div class="swal2-success-circular-line-left" style="background: rgb(255, 255, 255);"></div>
                    <span class="swal2-success-line-tip swal2-animate-success-line-tip"></span>
                    <span class="swal2-success-line-long swal2-animate-success-line-long"></span>
                    <div class="swal2-success-ring"></div>
                    <div class="swal2-success-fix" style="background: rgb(255, 255, 255);"></div>
                    <div class="swal2-success-circular-line-right" style="background: rgb(255, 255, 255);"></div>
                </div>
            );
        }
    }
}

export default toNative(ModalAnimationSuccess);
