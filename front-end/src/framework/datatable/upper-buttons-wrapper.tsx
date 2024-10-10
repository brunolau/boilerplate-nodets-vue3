import { Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { Portal } from "portal-vue";
interface DataTableUpperButtonsWrapperArgs {
    hasCheckbox?: boolean;
    cssClass?: string;
}

@Component({
    components: {
        portal: Portal,
    },
})
export default class DataTableUpperButtonsWrapper extends TsxComponent<DataTableUpperButtonsWrapperArgs> implements DataTableUpperButtonsWrapperArgs {
    @Prop() hasCheckbox?: boolean;
    @Prop() cssClass?: string;

    private getCssClass(): string {
        let builder = "table-upper-buttons-wrap";
        if (this.hasCheckbox) {
            builder += " wrap-has-checkbox";
        }

        if (!isNullOrEmpty(this.cssClass)) {
            builder += " " + this.cssClass;
        }

        return builder;
    }

    private render(h) {
        if (portalUtils.isIOS()) {
            return (
                <div class={"ios-table-upper-buttons-wrap" + (this.hasCheckbox ? " wrap-has-checkbox" : "")}>
                    <portal mountTo="#bs-dtbtn-container" append="true">
                        <div class={this.getCssClass()}>{this.$slots.default?.()}</div>
                    </portal>
                </div>
            );
        } else {
            return <div class={this.getCssClass()}>{this.$slots.default?.()}</div>;
        }
    }
}
