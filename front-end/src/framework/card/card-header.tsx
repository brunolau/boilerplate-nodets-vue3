import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";

interface CardHeaderArgs {
    title?: string;
    subtitle?: string;
    smallTitle?: string;
}

@Component
class CardHeader extends TsxComponent<CardHeaderArgs> implements CardHeaderArgs {
    @Prop() title!: string;
    @Prop() subtitle!: string;
    @Prop() smallTitle?: string;

    render(h) {
        return (
            <div class="card-header ">
                {this.smallTitle && <h6 class="card-small-title">{this.smallTitle}</h6>}

                {this.title && (
                    <h5 class="card-title">
                        {this.title}

                        {this.subtitle != null && this.subtitle.length > 0 && <small class="description d-none d-md-inline"> - {this.subtitle}</small>}
                    </h5>
                )}
            </div>
        );
    }
}

export default toNative(CardHeader);
