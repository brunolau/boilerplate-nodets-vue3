import { Prop, toNative } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { NamePreserver } from "../../common/name-preserver";
import Fieldset from "../../framework/form/fieldset";

interface TabPageArgs {
    navCaption: string;
    navCaptionShort?: string;
    tabCaption?: string;
    escapeCaption?: boolean;
    collapsedByDefault?: boolean;
    icon: string;
    uuid?: string;
}

@NamePreserver("TabPage")
@Component
class ModalSection extends TsxComponent<TabPageArgs> implements TabPageArgs {
    @Prop() navCaption!: string;
    @Prop() navCaptionShort!: string;
    @Prop() tabCaption!: string;
    @Prop() escapeCaption?: boolean;
    @Prop() icon!: string;
    @Prop() uuid!: string;
    @Prop() collapsedByDefault: boolean;
    active: boolean = false;

    render(h) {
        if (AppState.modalSectionMode == ModalSectionMode.fieldSet) {
            return (
                <Fieldset isCollapsedByDefault={this.collapsedByDefault} caption={this.navCaption}>
                    {this.$slots.default?.()}
                </Fieldset>
            );
        }

        return <div class="tab-page-wrap">{this.$slots.default}</div>;
    }
}

export default toNative(ModalSection);
