import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
interface ModalFooterArgs {}

@Component
class ModalFooter extends TsxComponent<ModalFooterArgs> implements ModalFooterArgs {
    render(h) {
        return <div class="modal-footer">{this.$slots.default?.()}</div>;
    }
}

export default toNative(ModalFooter);
