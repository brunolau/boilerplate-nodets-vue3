import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";

interface LoadingIndicatorArgs {
    visible: boolean;
    cssClass?: string;
}

@Component
class LoadingIndicator extends TsxComponent<LoadingIndicatorArgs> implements LoadingIndicatorArgs {
    @Prop() visible: boolean;
    @Prop() cssClass: string;

    render(h) {
        if (this.visible) {
            return this.renderBlocker(h);
        } else {
            return null;
        }
    }

    renderBlocker(h) {
        return (
            <div class={(this.cssClass || "holdon-white") + " holdon-overlay holdon-element"}>
                <div class="holdon-content">
                    <div class="sk-rect">
                        <div class="rect1"></div>
                        <div class="rect2"></div>
                        <div class="rect3"></div>
                        <div class="rect4"></div>
                        <div class="rect5"></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default toNative(LoadingIndicator);
