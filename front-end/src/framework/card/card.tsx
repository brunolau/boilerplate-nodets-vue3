import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";

export const enum CardRole {
    Normal = 0,
    RootCard = 1,
}

interface CardArgs {
    role?: CardRole;
    renderMode?: "default" | "inlined";
    hasShadow?: boolean;
}

@Component
class Card extends TsxComponent<CardArgs> implements CardArgs {
    @Prop() role!: CardRole;
    @Prop() hasShadow!: boolean;
    @Prop() renderMode?: "default" | "inlined";

    render(h) {
        return (
            <div class={"card" + (this.role == CardRole.RootCard ? " single-card root-element" : "") + this.getStickyCssClass() + this.getBoxShadowCardCss() + this.getRenderModeCardCss()}>
                {this.$slots.default?.()}
            </div>
        );
    }

    getStickyCssClass(): string {
        var cssClass = "";
        var stickyDeclaration = AppState.stickyTabs;

        if (stickyDeclaration.HasSticky) {
            cssClass += " has-main-nav-tabs";
        }

        if (stickyDeclaration.AllowTabChange == false) {
            cssClass += " no-tab-switch";
        }

        return cssClass;
    }

    getBoxShadowCardCss(): string {
        if (this.renderMode == "inlined" || this.hasShadow == true) {
            return " with-card-shadow";
        }

        return "";
    }

    getRenderModeCardCss(): string {
        if (this.renderMode == "inlined") {
            return " card-render-inlined";
        }

        return "";
    }
}

export default toNative(Card);
