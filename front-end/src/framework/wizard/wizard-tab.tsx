import { Prop, toNative } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { NamePreserver } from "../../common/name-preserver";

interface WizardTabArgs {
    id: string;
    title: string;
    subtitle?: string;
    icon: string;
    visible?: boolean;
}

@Component
@NamePreserver("WizardTab")
class WizardTab extends TsxComponent<WizardTabArgs> implements WizardTabArgs {
    @Prop() id!: string;
    @Prop() title!: string;
    @Prop() subtitle!: string;
    @Prop() icon!: string;
    @Prop() visible!: boolean;
    active: boolean = false;

    render(h) {
        return <div class="wizard-tab-wrap">{this.$slots.default?.()}</div>;
    }
}

export default toNative(WizardTab);
