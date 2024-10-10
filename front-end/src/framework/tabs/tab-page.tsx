import { Prop, toNative } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { NamePreserver } from "../../common/name-preserver";

interface TabPageArgs {
    navCaption: string;
    navCaptionShort?: string;
    tabCaption?: string;
    escapeCaption?: boolean;
    icon: string;
    uuid?: string;
}

@Component
@NamePreserver("TabPage")
class TabPageComponent extends TsxComponent<TabPageArgs> implements TabPageArgs {
    @Prop() navCaption!: string;
    @Prop() navCaptionShort!: string;
    @Prop() tabCaption!: string;
    @Prop() escapeCaption?: boolean;
    @Prop() icon!: string;
    @Prop() uuid!: string;
    active: boolean = false;

    render(h) {
        return <div class="tab-page-wrap">{this.$slots.default?.()}</div>;
    }
}

export const TabPage = toNative(TabPageComponent);
