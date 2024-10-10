import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";

export interface ContentEditableArgs {
    cssClass: string;
    editEnabled: boolean;
    value: string;
    placeholder?: string;
    changed: (e: string) => void;
}

@Component
class ContentEditable extends TsxComponent<ContentEditableArgs> implements ContentEditableArgs {
    @Prop() cssClass: string;
    @Prop() editEnabled: boolean;
    @Prop() value: string;
    @Prop() placeholder: string;
    @Prop() changed: (e: string) => void;

    render(h) {
        let cssClass = this.cssClass;
        if (this.value == null) {
            cssClass = (cssClass || "") + " cte-no-data";
        }

        return (
            <div
                class={cssClass}
                contenteditable={this.editEnabled}
                data-text={this.placeholder}
                onInput={(e) => {
                    this.changed(e.target.innerHTML);
                }}
            ></div>
        );
    }

    performSync() {
        if (this.value != this.$el.innerHTML) {
            this.$el.innerHTML = this.value;
        }
    }

    mounted() {
        this.performSync();
    }

    updated() {
        this.performSync();
    }
}

export default toNative(ContentEditable);
