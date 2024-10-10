import { Prop, toNative } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { NamePreserver } from "../../common/name-preserver";

interface AccordionPageArgs {
    caption: string;
    captionShort?: string;
    badge?: string;
    badgeStyle?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
    badgePosition?: "left" | "right";
}

@Component
@NamePreserver("AccordionPage")
class AccordionPageComponent extends TsxComponent<AccordionPageArgs> implements AccordionPageArgs {
    @Prop() caption!: string;
    @Prop() captionShort!: string;
    @Prop() badge!: string;
    @Prop() badgePosition!: "left" | "right";
    @Prop() badgeStyle!: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
    active: boolean = false;

    render(h) {
        return <div class="accordion-page-wrap">{this.$slots.default?.()}</div>;
    }
}

export const AccordionPage = toNative(AccordionPageComponent);
