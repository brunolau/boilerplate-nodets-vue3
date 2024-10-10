import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
interface ModalBodyArgs {
    fullHeight?: boolean;
}

@Component
class ModalBody extends TsxComponent<ModalBodyArgs> implements ModalBodyArgs {
    @Prop() fullHeight: boolean;

    render(h) {
        return <div class={"modal-body" + (this.fullHeight ? " modal-full-height" : "")}>{this.$slots.default?.()}</div>;
    }
}

export default toNative(ModalBody);
