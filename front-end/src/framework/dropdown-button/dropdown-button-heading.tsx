import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
interface DropdownButtonHeadingArgs {
    text: string;
}

@Component
class DropdownButtonHeading extends TsxComponent<DropdownButtonHeadingArgs> implements DropdownButtonHeadingArgs {
    @Prop() text!: string;

    render(h) {
        return <h6 class="dropdown-header">{this.text}</h6>;
    }
}

export default toNative(DropdownButtonHeading);
