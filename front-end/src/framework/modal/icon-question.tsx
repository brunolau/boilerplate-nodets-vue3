import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";

interface ModalIconQuestionArgs {
    visible: boolean;
}

@Component
class ModalIconQuestion extends TsxComponent<ModalIconQuestionArgs> implements ModalIconQuestionArgs {
    @Prop() visible!: boolean;

    render(h) {
        if (!this.visible) {
            return null;
        } else {
            return (
                <div class="swal2-icon swal2-question swal2-animate-question-icon" style="display: block;">
                    ?
                </div>
            );
        }
    }
}

export default toNative(ModalIconQuestion);
