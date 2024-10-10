import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
interface DropdownButtonItemArgs {}

@Component
class DropdownButtonSeparator extends TsxComponent<DropdownButtonItemArgs> implements DropdownButtonItemArgs {
    render(h) {
        return <div class="dropdown-divider"></div>;
    }
}

export default toNative(DropdownButtonSeparator);
