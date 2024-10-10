import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import WizardTab from "./wizard-tab";
import Button from "../button/button";
import { ButtonLayout } from "../button/button-layout";
import LaddaButton from "../button/ladda-button";
import "./css/wizard.css";

interface WizardArgs {
    fullSizeOnMobile?: boolean;
    activePageChanged?: (tabId: string) => void;
    validate?: (h, tabId: string) => Promise<boolean>;
    submitClicked?: () => Promise<any>;
    submitText?: string;
    customButtons?: (h, tabId: string) => any;
}

@Component
class WizardComponent extends TsxComponent<WizardArgs> implements WizardArgs {
    @Prop() submitClicked: () => Promise<any>;
    @Prop() validate: (tabId: string) => Promise<boolean>;
    @Prop() activePageChanged?: (tabId: string) => void;
    @Prop() customButtons: (h, tabId: string) => any;
    @Prop() fullSizeOnMobile: boolean;
    @Prop() submitText!: string;
    activePageIndex: number = 0;

    private getChildTabs(): typeof WizardTab.prototype[] {
        return (this.getSlotProperties("WizardTab") as typeof WizardTab.prototype[]).filter((p) => p.visible != false);
    }

    public setActivePageIndex(index: number): void {
        this.activePageIndex = index;
    }

    public getActivePageIndex(): number {
        return this.activePageIndex;
    }

    public nextPage(): void {
        if (this.validate != null) {
            var activeTab = this.getChildTabs()[this.getActivePageIndex()];
            this.validate(activeTab.id).then((valid) => {
                if (valid) {
                    this.performNextPage();
                }
            });
        } else {
            this.performNextPage();
        }
    }

    private performNextPage(): void {
        this.activePageIndex += 1;
        if (this.activePageIndex >= this.getChildTabs().length) {
            this.activePageIndex = this.getChildTabs().length - 1;
        }

        if (this.activePageChanged != null) {
            this.activePageChanged(this.getChildTabs()[this.activePageIndex].id);
        }
    }

    private previousPage(): void {
        this.activePageIndex -= 1;
        if (this.activePageIndex < 0) {
            this.activePageIndex = 0;
        }

        if (this.activePageChanged != null) {
            this.activePageChanged(this.getChildTabs()[this.activePageIndex].id);
        }
    }

    private onHeaderClicked(newIndex: number): void {
        if (this.activePageIndex > newIndex) {
            this.activePageIndex = newIndex;

            if (this.activePageChanged != null) {
                this.activePageChanged(this.getChildTabs()[this.activePageIndex].id);
            }
        }
    }

    private render(h) {
        var childTabs = this.getChildTabs();
        var activeIndex = this.getActivePageIndex();
        var activeTab: typeof WizardTab.prototype = childTabs[activeIndex] || ({} as any);
        let widthPct = 100 / childTabs.length;
        let lineWidth = 100 - widthPct + 1;
        let btnRender = this.customButtons != null ? this.customButtons(h, activeTab.id) : null;

        return (
            <div class={"wizard" + (this.fullSizeOnMobile == true ? " wizard-fullsize-mob" : "") + " wizard-activetab-" + activeTab.id}>
                <div class="wizard-inner">
                    <div class="wz-connecting-line" style={"width:" + lineWidth + "%;"}></div>
                    <ul class="nav nav-tabs" role="tablist">
                        {childTabs.map((tab, i) => (
                            <li role="presentation" class={activeIndex == i ? "active" : "disabled"} style={"width:" + widthPct + "%;"}>
                                <a
                                    href="javascript:"
                                    data-toggle="tab"
                                    role="tab"
                                    onClick={(e) => {
                                        this.onHeaderClicked(i);
                                    }}
                                >
                                    <span class="round-tab" data-itstooltip={tab.title}>
                                        <i class={tab.icon}></i>
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div role="form">
                    <div class="tab-content">
                        <div class="tab-pane active" role="tabpanel">
                            <h4 class="wizard-title">{activeTab.title}</h4>
                            {activeTab.subtitle && <p class="wizard-subtitle">{activeTab.subtitle}</p>}

                            {this.$slots.default?.()[activeIndex]}
                        </div>

                        <div class="wizard-buttons">
                            {activeIndex > 0 && (
                                <Button
                                    text={AppState.resources.back}
                                    layout={ButtonLayout.Default}
                                    icon="icon icon-arrow-left-circle"
                                    cssClass="wizard-btn-back"
                                    clicked={() => {
                                        this.previousPage();
                                    }}
                                />
                            )}
                            {activeIndex < childTabs.length - 1 && (
                                <Button
                                    text={AppState.resources.continue}
                                    layout={ButtonLayout.Primary}
                                    icon="icon icon-arrow-right-circle"
                                    cssClass="wizard-btn-forward"
                                    iconOnRight={true}
                                    clicked={() => {
                                        this.nextPage();
                                    }}
                                />
                            )}
                            {activeIndex == childTabs.length - 1 && (
                                <LaddaButton
                                    text={this.submitText || AppState.resources.submit}
                                    layout={ButtonLayout.Primary}
                                    icon="icon icon-check"
                                    cssClass="wizard-btn-submit"
                                    iconOnRight={true}
                                    clicked={async () => {
                                        await this.submitClicked();
                                    }}
                                />
                            )}

                            {btnRender}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default toNative(WizardComponent);
