import { Prop, toNative } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import "./css/modal-subtitle.css";

interface TabPageArgs {
    text: string;
}

@Component
class ModalSubtitle extends TsxComponent<TabPageArgs> implements TabPageArgs {
    @Prop() text: string;

    render(h) {
        return <small class="edit-modal-subtitle">{this.text}</small>;
    }
}

export default toNative(ModalSubtitle);
