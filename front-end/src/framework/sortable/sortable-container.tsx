import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import Sortable from "sortablejs";

interface SortableContainerArgs {
    cssClass?: string;
    filterSelector?: string;
    handleSelector?: string;
    sortComplete: (args: SortableOnSortedArgs) => void;
}

export interface SortableOnSortedArgs {
    oldIndex: number;
    newIndex: number;
}

//NOT WORKING????
//Ensure the child elements are custom components and do have "key" property uniquely setup

@Component
class SortableContainer extends TsxComponent<SortableContainerArgs> implements SortableContainerArgs {
    @Prop() handleSelector!: string;
    @Prop() filterSelector!: string;
    @Prop() cssClass!: string;
    @Prop() sortComplete: (args: SortableOnSortedArgs) => void;

    bindSortableJs() {
        let args = {
            animation: 150,
            onEnd: (evt) => {
                this.sortComplete(evt);
            },
        } as any;

        if (!isNullOrEmpty(this.handleSelector)) {
            args.handle = this.handleSelector;
        }

        if (!isNullOrEmpty(this.filterSelector)) {
            args.filter = this.filterSelector;
        }

        new Sortable(this.$el, args);
    }

    mounted() {
        this.$nextTick(() => {
            this.bindSortableJs();
        });
    }

    render(h) {
        return (
            <div style="position:relative;" class={this.cssClass} key={0}>
                {this.$slots.default?.()}
            </div>
        );
    }
}

export default toNative(SortableContainer);
