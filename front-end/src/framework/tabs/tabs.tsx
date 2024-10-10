import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { TabPage } from "./tab-page";
import Card from "../card/card";
import CardHeader from "../card/card-header";
import CardBody from "../card/card-body";
import { NamePreserver } from "../../common/name-preserver";
import HtmlLiteral from "../html-literal/html-literal";

export const enum TabsRenderMode {
    Normal = 0,
    SidePills = 1,
    SidePillsExtended = 2,
}

interface TabsArgs {
    renderMode?: TabsRenderMode;
    stickyOnMobile?: boolean;
    initialTabIndex?: number;
    allowTabSwitch?: boolean;
    cardHasShadow?: boolean;
    cardRenderMode?: "default" | "inlined";
    renderHiddenTabs?: boolean;
}

@Component
class Tabs extends TsxComponent<TabsArgs> implements TabsArgs {
    @Prop() renderMode!: TabsRenderMode;
    @Prop() stickyOnMobile!: boolean;
    @Prop() initialTabIndex!: number;
    @Prop() allowTabSwitch!: boolean;
    @Prop() cardHasShadow!: boolean;
    @Prop() renderHiddenTabs!: boolean;
    @Prop() cardRenderMode?: "default" | "inlined";
    registeredCount: number = null;
    activePageIndex: number = null;
    uuid: string = null;

    created() {
        if (this.initialTabIndex != null) {
            this.setActivePageIndex(this.initialTabIndex);
        } else {
            this.setActivePageIndex(0);
        }
    }

    mounted() {
        this.ensureStickyTabs();
    }

    updated() {
        this.ensureStickyTabs();
    }

    beforeDestroy() {
        if (this.uuid != null) {
            AppState.unregisterStickyTabs(this.uuid);
        }
    }

    ensureStickyTabs(): void {
        if (this.uuid == null) {
            this.uuid = "t-" + portalUtils.randomString(8);
        }

        if (this.stickyOnMobile == true) {
            AppState.registerStickyTabs(this.uuid, {
                HasSticky: this.stickyOnMobile == true,
                AllowTabChange: this.allowTabSwitch != false,
            });
        }
    }

    getChildTabs(): typeof TabPage.prototype[] {
        return this.getSlotProperties("TabPageComponent");
    }

    getContentCssClass(): string {
        if (this.allowTabSwitch != false) {
            return "col-md-9 col-lg-10 tab-content";
        } else {
            return "col-md-12 tab-content";
        }
    }

    getCardHasShadow(): boolean {
        if (this.cardHasShadow != null) {
            return this.cardHasShadow;
        }

        if (this.renderMode == TabsRenderMode.SidePillsExtended) {
            return true;
        }

        return false;
    }

    getCardRenderMode(): "default" | "inlined" {
        if (!isNullOrEmpty(this.cardRenderMode)) {
            return this.cardRenderMode;
        }

        if (this.renderMode == TabsRenderMode.SidePillsExtended) {
            return "inlined";
        }

        return "default";
    }

    getActivePageIndex(): number {
        if (this.renderHiddenTabs != true) {
            return this.activePageIndex || 0;
        } else {
            return (this as any)._activeIndex || 0;
        }
    }

    setActivePageIndex(index: number): void {
        if (this.renderHiddenTabs != true) {
            this.activePageIndex = index;
        } else {
            (this as any)._activeIndex = index;
        }
    }

    render(h) {
        if (this.renderMode == null || this.renderMode == TabsRenderMode.SidePills || this.renderMode == TabsRenderMode.SidePillsExtended) {
            return this.renderSidePillsMode(h);
        } else if (this.renderMode == TabsRenderMode.Normal) {
            return this.renderNormalMode(h);
        } else {
            console.error("Render mode not implemented");
            return <div>Render mode not implemented</div>;
        }
    }

    getTabHref(tab: typeof TabPage.prototype, index: number): string {
        if (this.renderHiddenTabs != true) {
            return "javascript:";
        } else {
            return "#" + this.uuid + "-tab-" + index;
        }
    }

    getActiveSlots(): any[] {
        if (this.renderHiddenTabs != true) {
            return [this.$slots.default?.()[this.getActivePageIndex()]];
        } else {
            return this.$slots.default?.();
        }
    }

    renderSidePillsMode(h) {
        const childTabs = this.getChildTabs();
        const activeIndex = this.getActivePageIndex();
        const activeTab: typeof TabPage.prototype = childTabs[activeIndex] || ({} as any);
        const fadeOutMode = this.renderHiddenTabs == true;

        return (
            <div class={"row tabs-root side-pills-mode-" + (this.renderMode == TabsRenderMode.SidePillsExtended ? "extended" : "normal")}>
                {this.allowTabSwitch != false && (
                    <div class={"col-md-3 col-lg-2 tab-buttons-wrap" + (this.stickyOnMobile ? " main-nav-tabs-wrap" : "")}>
                        <ul
                            class={"nav nav-pills nav-pills-secondary nav-pills-icons flex-column " + "nav-" + childTabs.length + "-items" + (this.stickyOnMobile ? " main-nav-tabs" : "")}
                            role="tablist"
                        >
                            {childTabs.map((tab, i) => (
                                <li class="nav-item" data-uuid={tab.uuid} data-index={i}>
                                    <a
                                        class={"nav-link inv-tab-button" + (activeIndex == i ? " active" : "")}
                                        id={this.uuid + "-button-" + i}
                                        data-bs-toggle={fadeOutMode ? "tab" : null}
                                        data-bs-target={fadeOutMode ? this.getTabHref(tab, i) : null}
                                        href={"javascript:"}
                                        role="tab"
                                        onClick={() => {
                                            this.setActivePageIndex(i);
                                        }}
                                    >
                                        <i class={tab.icon}></i>
                                        {tab.escapeCaption != false ? (
                                            <span>
                                                <span class="nav-caption-long">{tab.navCaption}</span>
                                                <span class="nav-caption-short">{tab.navCaptionShort || tab.navCaption}</span>
                                            </span>
                                        ) : (
                                            <span>
                                                <span class="nav-caption-long">
                                                    <HtmlLiteral innerHTML={tab.navCaption} />
                                                </span>
                                                <span class="nav-caption-short">
                                                    <HtmlLiteral innerHTML={tab.navCaptionShort || tab.navCaption} />
                                                </span>
                                            </span>
                                        )}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div class={this.getContentCssClass()}>
                    {this.getActiveSlots().map((slot, i) => (
                        <div class={"tab-pane inv-tab-wrap fade show" + (activeIndex == i ? " active" : "")} id={this.uuid + "-tab-" + i} role="tabpanel" data-button-id={this.uuid + "-button-" + i}>
                            <Card hasShadow={this.getCardHasShadow()} renderMode={this.getCardRenderMode()}>
                                <CardHeader title={activeTab.tabCaption || activeTab.navCaption} />
                                <CardBody>{slot}</CardBody>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    renderNormalMode(h) {
        var childTabs = this.getChildTabs();
        var activeIndex = this.getActivePageIndex();

        return (
            <div class="tabs-normal-mode">
                {this.allowTabSwitch != false && (
                    <div class={this.stickyOnMobile ? " main-nav-tabs-wrap" : ""}>
                        <ul class={"nav nav-pills nav-pills-primary " + "nav-" + childTabs.length + "-items" + (this.stickyOnMobile ? " main-nav-tabs" : "")} role="tablist">
                            {childTabs.map((tab, i) => (
                                <li class="nav-item" data-uuid={tab.uuid} data-index={i}>
                                    <a
                                        class={"nav-link inv-tab-button" + (activeIndex == i ? " active" : "")}
                                        href="javascript:"
                                        role="tab"
                                        onClick={() => {
                                            this.setActivePageIndex(i);
                                        }}
                                    >
                                        {tab.icon != null && <i class={tab.icon}></i>}

                                        {tab.escapeCaption != false ? (
                                            <span>
                                                <span class="nav-caption-long">{tab.navCaption}</span>
                                                <span class="nav-caption-short">{tab.navCaptionShort || tab.navCaption}</span>
                                            </span>
                                        ) : (
                                            <span>
                                                <span class="nav-caption-long">
                                                    <HtmlLiteral innerHTML={tab.navCaption} />
                                                </span>
                                                <span class="nav-caption-short">
                                                    <HtmlLiteral innerHTML={tab.navCaptionShort || tab.navCaption} />
                                                </span>
                                            </span>
                                        )}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div class="tab-content">
                    {this.renderHiddenTabs != true && this.renderActiveTab(h)}
                    {this.renderHiddenTabs == true && this.$slots.default?.().map((tab) => <div class="dopiceee">{tab}</div>)}
                </div>
            </div>
        );
    }

    renderActiveTab(h) {
        return <div>{this.$slots.default?.()?.[0]?.children?.[this.getActivePageIndex()]}</div>;
    }
}

export default toNative(Tabs);
