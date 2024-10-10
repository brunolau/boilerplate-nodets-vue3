import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import "./css/tilebox-alt.css";

export const enum TileboxColor {
    Purple = "tlb-purple",
    Black = "tlb-black",
    Yellow = "tlb-yellow",
    Red = "tlb-red",
    Blue = "tlb-blue",
    Rusty = "tlb-rusty",
    Green = "tlb-green",
    DarkPurple = "tlb-darkpurple",
}

interface TileboxArgs {
    icon: string;
    title: string;
    subtitle: string;
    url?: string;
    gridClass: string;
    color: TileboxColor;
    isRouterLink?: boolean;
    clicked?: () => void;
}

@Component
class Tilebox extends TsxComponent<TileboxArgs> implements TileboxArgs {
    @Prop() icon!: string;
    @Prop() title!: string;
    @Prop() subtitle!: string;
    @Prop() url!: string;
    @Prop() gridClass!: string;
    @Prop() color!: TileboxColor;
    @Prop() isRouterLink!: boolean;
    @Prop() clicked: () => void;

    render(h) {
        if (this.clicked != null) {
            return (
                <a class={this.gridClass + " tilebox"} style="height: 100%;" href="javascript:" onClick={this.clicked}>
                    {this.renderInner(h)}
                </a>
            );
        } else if (this.isRouterLink) {
            return (
                <router-link class={this.gridClass + " tilebox"} style="height: 100%;" to={this.url}>
                    {this.renderInner(h)}
                </router-link>
            );
        } else {
            return (
                <a class={this.gridClass + " tilebox"} style="height: 100%;" href={this.url}>
                    {this.renderInner(h)}
                </a>
            );
        }
    }

    renderInner(h) {
        return (
            <div class={this.color + " tilebox-wrap"}>
                <i class={this.icon + " tilebox-icon"}></i>
                <div class="tile-object">
                    <br />
                    <div class="name tilebox-title">
                        <div>{this.title}</div>
                    </div>
                    <div class="tilebox-subcontent">
                        <div>
                            <span class="tilebox-subcontent-inner">{this.subtitle}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default toNative(Tilebox);
