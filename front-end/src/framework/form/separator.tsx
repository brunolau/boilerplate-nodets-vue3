import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import "./css/separator.css";

interface SeparatorArgs {
    text: string;
}

@Component
class Separator extends TsxComponent<SeparatorArgs> implements SeparatorArgs {
    @Prop() text!: string;

    render(h) {
        return <div class="ifw-separator">{this.text}</div>;
    }
}

export default toNative(Separator);
