import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { FormItemWrapperArgs, MarginType } from "../form/form-item-wrapper";
import DropdownList, { MultiselectMode, DropdownListButton, DropdownListTagAddedArgs } from ".";
import { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";
import "./css/image-dropdown.css";

interface ImageDropdownArgs extends FormItemWrapperArgs {
    options: ImageDropdownDataItem[];
    selected: ImageDropdownDataItem[];
    tagsTemplate?: string;
    tagsAdded?: (e: DropdownListTagAddedArgs) => void;
    placeholder?: string;
    buttons?: DropdownListButton[];
    changed: (newValue: ImageDropdownDataItem[]) => void;
    afterBound?: (elem: JQuery<Element>, select2Instance: any) => void;
}

export interface ImageDropdownButtonClickedArgs {
    item: any;
}

export interface ImageDropdownDataItem {
    id: string | number;
    text: string;
    subtitle?: string;
    imageUrl: string;
    dataRow?: any;
}

@Component
class ImageDropdown extends TsxComponent<ImageDropdownArgs> implements ImageDropdownArgs {
    @Prop() label!: string;
    @Prop() labelButtons!: DropdownButtonItemArgs[];
    @Prop() placeholder!: string;
    @Prop() mandatory!: boolean;
    @Prop() marginType?: MarginType;
    @Prop() wrap!: boolean;
    @Prop() hint: string;
    @Prop() subtitle!: string;
    @Prop() appendIcon: string;
    @Prop() prependIcon: string;
    @Prop() tagsTemplate!: string;
    @Prop() tagsAdded?: (e: DropdownListTagAddedArgs) => void;
    @Prop() appendClicked: () => void;
    @Prop() prependClicked: () => void;
    @Prop() buttons: DropdownListButton[];
    @Prop() options: ImageDropdownDataItem[];
    @Prop() selected: ImageDropdownDataItem[];
    @Prop() changed: (newValue: ImageDropdownDataItem[]) => void;
    @Prop() afterBound: (elem: JQuery<Element>, select2Instance: any) => void;

    raiseChangeEvent(e) {
        this.populateValidationDeclaration();
        this.changed(e);
    }

    getSelectionTemplate(state, allOpts: ImageDropdownDataItem[]): string | JQuery {
        if (!state) return "";
        if (!state.id) return state.text;

        let dataItem = allOpts.filter((p) => p.id.toString() == state.id)[0];
        if (dataItem == null) {
            return state.text;
        }

        return $(
            '<div class="imgddl-dropdown-wrap"><div class="imgddl-image" style="background-image:url(\'' +
                dataItem.imageUrl +
                '\')"></div><div class="imgddl-text">' +
                portalUtils.htmlEscape(dataItem.text) +
                '</div><div class="imgddl-subtitle">' +
                portalUtils.htmlEscape(dataItem.subtitle) +
                "</div></div>"
        );
    }

    getResultItemTemplate(state, allOpts: ImageDropdownDataItem[]): string | JQuery {
        if (!state) return "";
        if (!state.id) return state.text;

        let dataItem = allOpts.filter((p) => p.id.toString() == state.id)[0];
        if (dataItem == null) {
            return state.text;
        }

        let builder =
            '<div class="imgddl-dropdown-resultroot"><div class="imgddl-dropdown-resultwrap"><div class="imgddl-result-image" style="background-image:url(\'' +
            dataItem.imageUrl +
            '\')"></div><div class="imgddl-result-text">' +
            portalUtils.htmlEscape(dataItem.text) +
            "</div>";
        (this.buttons || ([] as DropdownListButton[])).forEach((button, i) => {
            builder += '<span class="imgddl-result-button imgdll-clickable-button" data-index="' + i + '" role="presentation"><i class="' + button.iconCss + '"></i></span>';
        });

        return $(builder + "</div></div>");
    }

    onAfterBound(elem: JQuery<Element>, select2Instance: any) {
        this.patchButtonClick(select2Instance);
        this.patchUpdateFlicker(select2Instance);

        if (this.afterBound != null) {
            this.afterBound(elem, select2Instance);
        }
    }

    patchButtonClick(select2Instance: any) {
        let $selection = select2Instance.$selection as JQuery<Element>;
        if ($selection.attr("data-imgddbtn-bound") != "yeah") {
            let self = this;
            $selection.attr("data-imgddbtn-bound", "yeah");
            $selection.on("click", ".imgdll-clickable-button", function (e) {
                let $this = $(this);
                let buttonIndex = $this.attr("data-index");
                let selectionData = $this.parent().parent().parent().data("data");
                let opts = (self.$refs.ddList as typeof DropdownList.prototype).getOptions();
                let dataItem = opts.filter((p) => p.id == selectionData.id)[0];

                (self.buttons[buttonIndex] as DropdownListButton).clicked({
                    item: dataItem != null ? dataItem.dataRow : null,
                });

                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            });
        }
    }

    //This is kinda too much of an internal hack, might change in any future versions of Select2
    patchUpdateFlicker(select2Instance: any) {
        let ddSelf = this;
        let self = select2Instance.selection;

        self.update = function (data: any[]) {
            var searchHadFocus = self.$search[0] == document.activeElement;
            self.$search.attr("placeholder", "");

            ddSelf._performSelectionUpdate(self, data);
            self.$selection.find(".select2-selection__rendered").append(self.$searchContainer);

            self.resizeSearch();
            if (searchHadFocus) {
                self.$search.focus();
            }
        };
    }

    //This is kinda too much of an internal hack, might change in any future versions of Select2
    _performSelectionUpdate(self: any, data: any[]) {
        let $rendered = self.$selection.find(".select2-selection__rendered") as JQuery<Element>;
        let currentItems = $rendered.find(".imgddl-selected-item");
        let noChange = false;

        if (currentItems.length == data.length && currentItems.length > 0) {
            noChange = true;
            for (var i = 0, len = data.length; i < len; i++) {
                if (data[i].id != currentItems[i].getAttribute("data-id")) {
                    noChange = false;
                    break;
                }
            }
        }

        if (noChange) {
            return;
        }

        self.$selection.find(".imgddl-selected-item").remove();
        self.$selection.find(".select2-selection__choice").remove();

        if (data.length === 0) {
            return;
        }

        var $selections = [];
        for (var d = 0; d < data.length; d++) {
            var selection = data[d];

            var $selection = self.selectionContainer();
            var formatted = self.display(selection, $selection);

            $selection.append(formatted);
            $selection.prop("title", selection.title || selection.text);

            $selection.data("data", selection);
            $selection.attr("data-id", selection.id);

            $selections.push($selection);
        }

        $rendered.append($selections);
    }

    render(h) {
        return (
            <DropdownList
                ref="ddList"
                options={this.options}
                formatSelection={(e) => {
                    return this.getResultItemTemplate(e, this.options);
                }}
                formatResult={(e) => {
                    return this.getSelectionTemplate(e, this.options);
                }}
                multiselect={true}
                multiselectMode={MultiselectMode.Tags}
                tags={true}
                tagsShouldPrependContent={true}
                tagsTemplate={
                    this.tagsTemplate ||
                    '<li class="imgddl-selected-item"><span class="imgddl-result-remove imgddl-result-button select2-selection__choice__remove" role="presentation"><i class="fas fa-times"></i></span></li>'
                }
                tagsAdded={this.tagsAdded}
                tagsNewPlaceLast={true}
                wrap={this.wrap}
                mandatory={this.mandatory}
                label={this.label}
                labelButtons={this.labelButtons}
                subtitle={this.subtitle}
                selected={this.selected}
                hint={this.hint}
                afterBound={(s2Elem, s2Instance) => {
                    this.onAfterBound(s2Elem, s2Instance);
                }}
                appendIcon={this.appendIcon}
                prependIcon={this.prependIcon}
                appendClicked={this.appendClicked}
                prependClicked={this.prependClicked}
                marginType={this.marginType}
                changed={(e) => this.raiseChangeEvent(e)}
            />
        );
    }
}

export default toNative(ImageDropdown);
