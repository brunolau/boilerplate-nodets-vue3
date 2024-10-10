import { Prop, toNative } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { AccordionPage } from "./accordion-page";
import "./css/accordion.css";
import Button from "../button/button";
import { ButtonLayout, ButtonSize } from "../button/button-layout";

interface AccordionArgs {
    multiSelectable?: boolean;
    skin?: AccordionSkin;
    ctaButton?: AccordionCallToActionButton;
    tabWillShow?: () => void;
    tabShown?: () => void;
}

interface AccordionCallToActionButton {
    text: string;
    icon?: string;
}

export const enum AccordionSkin {
    Light = 0,
    Contrasting = 1,
}

@Component
class Accordion extends TsxComponent<AccordionArgs> implements AccordionArgs {
    @Prop() multiSelectable!: boolean;
    @Prop() skin!: AccordionSkin;
    @Prop() tabWillShow?: () => void;
    @Prop() tabShown?: () => void;
    @Prop() ctaButton?: AccordionCallToActionButton;
    uuid: string = portalUtils.randomString(8);

    mounted() {
        if (this.tabWillShow != null || this.tabShown != null) {
            this.$nextTick(() => {
                if (this.tabWillShow != null) {
                    $(this.$refs.accordionRoot).on("show.bs.collapse", () => {
                        this.tabWillShow();
                    });
                }

                if (this.tabShown != null) {
                    $(this.$refs.accordionRoot).on("shown.bs.collapse", () => {
                        this.tabShown();
                    });
                }
            });
        }
    }

    getChildPages(): typeof AccordionPage.prototype[] {
        return this.getSlotProperties("AccordionPage");
    }

    getComponentId(): string {
        return "acc-" + this.uuid;
    }

    getSkin(): AccordionSkin {
        return this.skin || AccordionSkin.Contrasting;
    }

    getCssClassSkin() {
        return "accordion-skin-" + (this.getSkin() == AccordionSkin.Contrasting ? "contrasting" : "light");
    }

    render(h) {
        var childTabs = this.getChildPages();
        var componentId = this.getComponentId();

        return (
            <div class={this.getCssClassSkin()}>
                <div id={componentId} ref="accordionRoot" role="tablist" aria-multiselectable={this.multiSelectable == true} class="card-collapse">
                    {childTabs.map((accPage, i) => (
                        <div class="card card-plain">
                            <div class="card-header" role="tab" id={componentId + "-head-" + i}>
                                <a
                                    data-toggle="collapse"
                                    data-parent={"#" + componentId}
                                    href={"#" + componentId + "-coll-" + i}
                                    aria-expanded="false"
                                    aria-controls={componentId + "-coll-" + i}
                                    class="collapsed"
                                >
                                    {accPage.caption}
                                    {this.ctaButton == null && <i class="now-ui-icons arrows-1_minimal-down"></i>}

                                    {accPage.badge != null && (
                                        <span
                                            class={"accordion-badge badge" + (!isNullOrEmpty(accPage.badgeStyle) ? " badge-" + accPage.badgeStyle : "")}
                                            style={"float:" + (accPage.badgePosition || "left")}
                                        >
                                            {accPage.badge}
                                        </span>
                                    )}

                                    {this.ctaButton != null && (
                                        <Button
                                            cssClass="accordion-cta-button"
                                            layout={ButtonLayout.Success}
                                            size={ButtonSize.Small}
                                            text={this.ctaButton.text}
                                            icon={this.ctaButton.icon || "now-ui-icons arrows-1_minimal-down"}
                                            iconOnRight={true}
                                            clicked={() => {}}
                                        />
                                    )}
                                </a>
                            </div>
                            <div
                                id={componentId + "-coll-" + i}
                                class="collapse"
                                role="tabpanel"
                                data-parent={"#" + componentId + (this.multiSelectable ? portalUtils.randomString(4) : "")}
                                aria-labelledby={componentId + "-head-" + i}
                                style=""
                            >
                                <div class="card-body">{this.$slots.default?.()[i]}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default toNative(Accordion);
