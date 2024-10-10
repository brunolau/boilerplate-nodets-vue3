import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import ContextMenuBinder, { ContextMenuArgs, ContextMenuBuildResponse } from "./context-menu-binder";

@Component
class ContextMenu extends TsxComponent<ContextMenuArgs> implements ContextMenuArgs {
    @Prop() selector: string;
    @Prop() build: ($trigger, e) => ContextMenuBuildResponse;

    mounted() {
        ContextMenuBinder.bindMenu({
            selector: this.selector,
            build: this.build,
        });
    }

    render(h) {
        return null;
    }
}

export default toNative(ContextMenu);
