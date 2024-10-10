import { Prop, toNative } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import Tabs, { TabsRenderMode } from "../../framework/tabs/tabs";
import "./css/modal-section-wrapper.css";

interface ModalSectionWrapperArgs {}

@Component
class ModalSectionWrapper extends TsxComponent<ModalSectionWrapperArgs> implements ModalSectionWrapperArgs {
    resetValidationErrors() {
        if (AppState.modalSectionMode == ModalSectionMode.navPills) {
            $(this.$el).find(".modalsection-has-error").removeClass("modalsection-has-error");
        }
    }

    displayValidationErrors() {
        if (AppState.modalSectionMode == ModalSectionMode.navPills) {
            this.resetValidationErrors();
            this.$nextTick(() => {
                this.$nextTick(() => {
                    this.patchTabsErrors();
                    this.$nextTick(() => {
                        this.patchTabsErrors();
                    });
                });
            });
        }
    }

    private patchTabsErrors() {
        const $root = $(this.$el);
        const $errArr = $root.find(".has-danger");

        $errArr.each(function (i, el) {
            const buttonId = $(el).closest(".inv-tab-wrap").attr("data-button-id");
            const $button = $("#" + buttonId);
            $button.addClass("modalsection-has-error");
        });

        if ($errArr.length > 0) {
            const activeButton = $root.find(".inv-tab-button.active");
            if (!activeButton.hasClass("modalsection-has-error")) {
                ($root.find(".inv-tab-button.modalsection-has-error").first()[0] as any).click();
            }
        }
    }

    render(h) {
        if (AppState.modalSectionMode == ModalSectionMode.fieldSet) {
            return <div>{this.$slots.default?.()}</div>;
        } else {
            return (
                <Tabs renderMode={TabsRenderMode.SidePillsExtended} renderHiddenTabs={AppState.modalSectionMode == ModalSectionMode.navPills}>
                    {this.$slots.default?.()}
                </Tabs>
            );
        }
    }
}

export default toNative(ModalSectionWrapper);
