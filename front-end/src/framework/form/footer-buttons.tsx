import { toNative } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
interface FooterButtonsArgs {}

@Component
class FooterButtons extends TsxComponent<FooterButtonsArgs> implements FooterButtonsArgs {
    render(h) {
        return (
            <div class="row footer-buttons">
                <div class="col-md-12 footer-buttons-inner">{this.$slots.default?.()}</div>
            </div>
        );
    }
}

export default toNative(FooterButtons);
