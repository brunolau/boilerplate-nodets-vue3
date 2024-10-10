import { toNative, Prop } from "vue-facing-decorator"
import TsxComponent, { Component } from "../../app/vuetsx"
import CardBody from "./card-body"
import Card from "./card"

export const enum CardRole {
    Normal = 0,
    RootCard = 1,
}

interface ImageCardArgs {
    role?: CardRole
    renderMode?: "default" | "inlined"
    hasShadow?: boolean
    imgUrl: string
    imgAlt?: string
}

@Component
class ImageCard extends TsxComponent<ImageCardArgs> implements ImageCardArgs {
    @Prop() role!: CardRole
    @Prop() hasShadow!: boolean
    @Prop() renderMode?: "default" | "inlined"
    @Prop() imgUrl: string
    @Prop() imgAlt?: string

    render(h) {
        return (
            <Card renderMode={"inlined"}>
                <div class="row g-0">
                    <div class="col-md-4">
                        <img
                            src={this.imgUrl}
                            class="img-fluid rounded-start h-100 object-fit-cover"
                            alt={this.imgAlt ?? "Image"}
                        />
                    </div>
                    <div class="col-md-8">
                        <CardBody>{this.$slots.default?.()}</CardBody>
                    </div>
                </div>
            </Card>
        )
    }

    getStickyCssClass(): string {
        var cssClass = ""
        var stickyDeclaration = AppState.stickyTabs

        if (stickyDeclaration.HasSticky) {
            cssClass += " has-main-nav-tabs"
        }

        if (stickyDeclaration.AllowTabChange == false) {
            cssClass += " no-tab-switch"
        }

        return cssClass
    }

    getBoxShadowCardCss(): string {
        if (this.renderMode == "inlined" || this.hasShadow == true) {
            return " with-card-shadow"
        }

        return ""
    }

    getRenderModeCardCss(): string {
        if (this.renderMode == "inlined") {
            return " card-render-inlined"
        }

        return ""
    }
}

export default toNative(ImageCard)
