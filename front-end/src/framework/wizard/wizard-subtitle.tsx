import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
interface WizardSubtitleArgs {}

@Component
class WizardSubtitle extends TsxComponent<WizardSubtitleArgs> implements WizardSubtitleArgs {
    render(h) {
        return <p class="wizard-subtitle">{this.$slots.default?.()}</p>;
    }
}

export default toNative(WizardSubtitle);
