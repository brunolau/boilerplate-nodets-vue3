import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";

interface ModalIconWarningArgs {
    visible: boolean;
}

@Component
class ModalIconWarning extends TsxComponent<ModalIconWarningArgs> implements ModalIconWarningArgs {
    @Prop() visible!: boolean;

    render(h) {
        if (!this.visible) {
            return null;
        } else {
            return (
                <div class="swal2-icon swal2-warning" style="display: block;">
                    !
                </div>
            );
        }
    }
}

export default toNative(ModalIconWarning);
