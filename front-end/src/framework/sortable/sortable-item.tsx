import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import Sortable from "sortablejs";

interface SortableItemArgs {
    uuid: string | number;
}

@Component
class SortableItem extends TsxComponent<SortableItemArgs> implements SortableItemArgs {
    @Prop() uuid!: string | number;

    render(h) {
        return <div key={this.uuid}>{this.$slots.default?.()}</div>;
    }
}

export default toNative(SortableItem);
