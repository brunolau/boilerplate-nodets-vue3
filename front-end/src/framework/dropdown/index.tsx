import { toNative, Prop, Watch } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import FilterableSelect from "./mobile/legacy_fdd";
import FormItemWrapper, { FormItemWrapperArgs, MarginType } from "../form/form-item-wrapper";
import { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";
import LoadingIndicator from "../loading-indicator";
import "select2";
import "./ts/select2-multi-checkboxes";
import Sortable from "sortablejs";
import "../../../node_modules/select2/dist/css/select2.css";
import "./css/dropdown.css";

type RowToString = (row) => string;
export const enum MultiselectMode {
    Tags = 0,
    Checkboxes = 1,
}

export const enum MultiSelectExclusivity {
    Inclusive = 0,
    Exclusive = 1,
}

export class DropdownOptionGroup {
    isOptGroup: true;
    text: string;
    children: Array<string> | Array<any>;
}

export interface DropdownListOption {
    id: number | string;
    text: string;
    dataRow?: any;
}

export interface DropdownListButton {
    iconCss: string;
    cssClass?: string;
    clicked: (e: DropdownListButtonClickedArgs) => void;
}

export interface DropdownListButtonClickedArgs {
    item: any;
}

export interface DropdownListTagAddedArgs {
    closeSelection: boolean;
    tagArr: string[];
}

interface DropdownListArgs extends FormItemWrapperArgs {
    placeholder?: string;
    blocked?: boolean;
    options: Array<string> | Array<DropdownOptionGroup> | Array<any>;
    selected: string | any | Array<string> | Array<any>;
    displayMember?: string | RowToString;
    valueMember?: string | RowToString;
    multiselect?: boolean;
    multiselectMode?: MultiselectMode;
    closeOnSelect?: boolean;
    trailingButton?: DropdownTrailingButtonArgs;
    tags?: boolean;
    tagsSortable?: boolean;
    tagsShouldPrependContent?: boolean;
    tagsTemplate?: string;
    tagsAdded?: (e: DropdownListTagAddedArgs) => void;
    tagsButtons?: (item: any) => DropdownListButton[];
    tagsNewPlaceLast?: boolean;
    allowExclusiveSearch?: boolean;
    dropdownAutoWidth?: boolean;
    mobileShortMode?: boolean;
    changedEventDelay?: number;
    changed: (newValue: string | any | Array<string> | Array<any>, exclusivity?: MultiSelectExclusivity) => void;
    afterBound?: (elem: JQuery<Element>, select2Instance: any) => void;
    noResultsFound?: () => void;
    formatResult?: (state: DropdownDisplayArgs) => JQuery | string;
    formatSelection?: (state: DropdownDisplayArgs) => JQuery | string;
    customIdProperty?: string;
}

interface DropdownDisplayArgs {
    id: string;
    text: string;
    dataRow: any;
}

interface DropdownCurrentData {
    data: DropdownDisplayArgs[];
    added: string[];
}

export interface DropdownTrailingButtonArgs {
    cssClass: string;
    icon: string;
    text: string;
    clicked: (row: any) => void;
}

class DropdownSelect2Helper {
    static getSelect2Instance(s2Elem: JQuery<Element>): any {
        return $(s2Elem).data("select2");
    }
}

@Component
class DropdownList extends TsxComponent<DropdownListArgs> implements DropdownListArgs {
    @Prop() label!: string;
    @Prop() labelButtons!: DropdownButtonItemArgs[];
    @Prop() blocked!: boolean;
    @Prop() mandatory!: boolean;
    @Prop() hint: string;
    @Prop() subtitle!: string;
    @Prop() appendIcon: string;
    @Prop() prependIcon: string;
    @Prop() appendIconClicked: () => void;
    @Prop() prependIconClicked: () => void;
    @Prop() appendClicked: () => void;
    @Prop() prependClicked: () => void;
    @Prop() allowExclusiveSearch!: boolean;
    @Prop() options!: Array<string> | Array<any>;
    @Prop() displayMember!: (row) => string | string;
    @Prop() valueMember!: (row) => string | string;
    @Prop() selected!: string | any | Array<string> | Array<any>;
    @Prop() changed: (newValue: string | any | Array<string> | Array<any>, exclusivity?: MultiSelectExclusivity) => void;
    @Prop() afterBound: (elem: JQuery<Element>, select2Instance: any) => void;
    @Prop() maxWidth?: number;
    @Prop() multiselect!: boolean;
    @Prop() multiselectMode!: MultiselectMode;
    @Prop() trailingButton!: DropdownTrailingButtonArgs;
    @Prop() closeOnSelect!: boolean;
    @Prop() tags!: boolean;
    @Prop() tagsSortable?: boolean;
    @Prop() tagsShouldPrependContent!: boolean;
    @Prop() tagsTemplate!: string;
    @Prop() tagsButtons!: (item: any) => DropdownListButton[];
    @Prop() tagsAdded: (e: DropdownListTagAddedArgs) => void;
    @Prop() tagsNewPlaceLast?: boolean;
    @Prop() wrap!: boolean;
    @Prop() mobileShortMode!: boolean;
    @Prop() dropdownAutoWidth!: boolean;
    @Prop() changedEventDelay!: number;
    @Prop() placeholder: string;
    @Prop() noResultsFound: () => void;
    @Prop() marginType?: MarginType;
    @Prop() formatResult: (state: DropdownDisplayArgs) => JQuery | string;
    @Prop() formatSelection: (state: DropdownDisplayArgs) => JQuery | string;
    @Prop() cssClass?: string;
    @Prop() customIdProperty?: string;

    currentSelected: string | any | Array<string> | Array<any> = this.selected;
    pendingChangeTimeout: any = null;
    preventDefaultTimeout: any = null;
    preventDefaultTrigger: boolean = null;
    currentExclusivity: MultiSelectExclusivity = null;
    skipChange: boolean = false;
    searchWasActive: boolean = false;

    raiseChangedEvent(valArr: DropdownDisplayArgs[], updateSelect2: boolean) {
        this.populateValidationDeclaration();

        var selVal: any = valArr.map((p) => p.dataRow);
        if (this.multiselect != true) {
            selVal = selVal[0];
        }

        this.currentSelected = selVal;
        if (this.changed != null) {
            this.changed(selVal, this.currentExclusivity);
        }

        if (updateSelect2) {
            this.updateSelect2();
        }
    }

    getValueFromArr(paramArr: string[], row): string {
        for (var i = 0, len = paramArr.length; i < len; i++) {
            var val = row[paramArr[i]];
            if (val == null) {
                val = row[paramArr[i].capitalize()];
            }

            if (val != null) {
                if (portalUtils.isString(val) && val.length > 0) {
                    return val;
                } else if (portalUtils.isNumber(val)) {
                    return val.toString();
                } else if (portalUtils.isFunction(val)) {
                    return val.call(row, row);
                }
            }
        }

        return null;
    }
    getReflectedRowValue(row: any, isValueMember: boolean): string {
        var member = isValueMember ? this.valueMember : this.displayMember;
        if (member == null) {
            if (isValueMember) {
                if (this.customIdProperty?.length > 0) {
                    return this.getValueFromArr([this.customIdProperty], row);
                }
                return this.getValueFromArr(["id", "uuid"], row);
            } else {
                return this.getValueFromArr(["name", "text", "identifier"], row);
            }
        } else if (portalUtils.isString(member)) {
            return row[member as any];
        } else if (portalUtils.isNumber(member)) {
            return row[member as any].toString();
        } else if (portalUtils.isFunction(member)) {
            return member.call(row, row);
        }
    }

    getOptions(preserveOptGroups?: boolean): DropdownDisplayArgs[] {
        var retVal: DropdownDisplayArgs[] = [];
        var opts = this.options as any;

        if (opts != null && opts.length > 0) {
            var firstItem = opts[0];
            if (portalUtils.isString(firstItem)) {
                opts.forEach((item) => retVal.push({ id: item, text: item, dataRow: item }));
            } else if (portalUtils.isNumber(firstItem)) {
                opts.forEach((item) => retVal.push({ id: item.toString(), text: item.toString(), dataRow: item.toString() }));
            } else if ((firstItem as DropdownOptionGroup).isOptGroup == true) {
                opts.forEach((optGroup: DropdownOptionGroup) => {
                    let groupArr: Array<DropdownDisplayArgs> = [];
                    let preserve = preserveOptGroups == true;

                    if (!preserve) {
                        groupArr = retVal;
                        groupArr.push({
                            id: -99438273213,
                            text: optGroup.text,
                            dataRow: optGroup,
                            isOptionGroup: true,
                        } as any);
                    } else {
                        let groupDef = {
                            text: optGroup.text,
                            children: groupArr,
                        };

                        retVal.push(groupDef as any);
                    }

                    optGroup.children.forEach((item) => {
                        groupArr.push({
                            id: this.getReflectedRowValue(item, true),
                            text: this.getReflectedRowValue(item, false),
                            dataRow: item,
                        });
                    });
                });
            } else {
                opts.forEach((item) => {
                    retVal.push({
                        id: this.getReflectedRowValue(item, true),
                        text: this.getReflectedRowValue(item, false),
                        dataRow: item,
                    });
                });
            }
        }

        return retVal;
    }

    getSelectedItems(): DropdownDisplayArgs[] {
        var opts = this.getOptions();
        if (this.currentSelected == null || opts.length == 0) {
            return [];
        }

        var retArr: DropdownDisplayArgs[] = [];
        var selItemArr: Array<string> = portalUtils.isArray(this.currentSelected) ? this.currentSelected : [this.currentSelected];

        selItemArr.forEach((arrItem) => {
            var selItem: string;
            if (portalUtils.isString(arrItem) || portalUtils.isNumber(arrItem)) {
                selItem = arrItem.toString();
            } else {
                selItem = this.getReflectedRowValue(arrItem, true);
            }

            for (var i = 0, len = opts.length; i < len; i++) {
                var ci = opts[i];
                if (ci.id == selItem) {
                    retArr.push(ci);
                    break;
                }
            }
        });

        return retArr;
    }

    getMobileSelectionText(): string {
        var opts = this.getOptions();
        var selectedItems = this.getSelectedItems();

        if (selectedItems.length > 2 || (this.mobileShortMode == true && selectedItems.length > 0)) {
            return AppState.resources.itemsOutOfArray.format(selectedItems.length, opts.length);
        } else if (selectedItems.length == 1) {
            return selectedItems[0].text;
        } else {
            return selectedItems.map((p) => p.text).join(", ");
        }
    }

    getRootBaseCssClass(): string {
        return (
            "s2-fw-root" +
            (!isNullOrEmpty(this.appendIcon) || !isNullOrEmpty(this.hint) ? " s2-append-icon" : "") +
            (!isNullOrEmpty(this.prependIcon) ? " s2-prepend-icon" : "") +
            (this.cssClass ? " " + this.cssClass : "")
        );
    }

    close() {
        $(this.$el).find(".make-select2")["select2"]("close");
    }

    render(h) {
        //Dummy stuff to ensure reactivity
        let dummyCss: string = "";
        if (this.currentSelected != null) {
            dummyCss += "ddl-dummy-selected" + this.currentSelected.toString().substring(0, 1);
        }
        if (this.options != null) {
            dummyCss += "opts";
        }

        return (
            <FormItemWrapper
                label={this.label}
                mandatory={this.mandatory}
                wrap={this.wrap}
                appendIcon={this.appendIcon}
                prependIcon={this.prependIcon}
                hint={this.hint}
                appendClicked={this.appendClicked}
                prependClicked={this.prependClicked}
                marginType={this.marginType}
                maxWidth={this.maxWidth}
                validationState={this.validationState}
                cssClass={dummyCss}
                subtitle={this.subtitle}
                labelButtons={this.labelButtons}
            >
                {this.renderDropdown(h)}
            </FormItemWrapper>
        );
    }

    renderDropdown(h) {
        if (this.useMobile()) {
            return this.renderMobileComponent(h);
        } else {
            return this.renderSelectComponent(h);
        }
    }

    renderSelectComponent(h) {
        return (
            <div class={this.getRootBaseCssClass() + (this.useMultiCheckbxoes() ? " s2-multi-chb" : "")}>
                <LoadingIndicator visible={this.blocked} />
                <select class="form-control maxwidth-input make-select2"></select>
            </div>
        );
    }

    renderMobileComponent(h) {
        var selectedText = this.getMobileSelectionText();
        if (selectedText == null || selectedText.length == 0) {
            selectedText = this.placeholder || "";
        }

        if (isNullOrEmpty(selectedText) && this.multiselect == true) {
            selectedText = "[" + AppState.resources.all + "]";
        }

        return (
            <span onClick={(e) => this.showMobilePicker(e)} class={"select2 select2-container select2-container--default s2-pseudo maxwidth-input " + this.getRootBaseCssClass()} dir="ltr">
                <span class="selection">
                    <span class="select2-selection select2-selection--single" role="combobox" aria-haspopup="true">
                        <span class="select2-selection__rendered mbl-ddl-text" title={selectedText} style="font-size: inherit;">
                            {selectedText}
                        </span>
                        <span class="select2-selection__arrow" role="presentation">
                            <b role="presentation"></b>
                        </span>
                    </span>
                </span>
                <span class="dropdown-wrapper" aria-hidden="true"></span>
            </span>
        );
    }

    getFormatResult() {
        if (this.trailingButton) {
            var self = this;
            return function (row) {
                var retVal = $(
                    '<span class="s2-ri-withtb">' +
                        row.text +
                        '<button class="s2-trailing-button ' +
                        (self.trailingButton.cssClass || "") +
                        ' btn-sm">' +
                        (self.trailingButton.icon != null ? '<i class="' + self.trailingButton.icon + '"></i> ' : "") +
                        (self.trailingButton.text || "") +
                        "</button></span>"
                );
                retVal.find("button").click(function (e) {
                    try {
                        clearTimeout(self.preventDefaultTimeout);
                        self.preventDefaultTrigger = null;
                    } catch (e) {}

                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();

                    if (self.trailingButton.clicked != null) {
                        self.trailingButton.clicked(row.dataRow);
                    }

                    return false;
                });

                return retVal;
            };
        }

        if (this.formatResult) {
            return this.formatResult;
        }

        return null;
    }

    isOptionGroupBinding(): boolean {
        if (this.options == null) {
            return false;
        }

        let firstOpt = this.options[0];
        if (firstOpt != null && (firstOpt as DropdownOptionGroup).isOptGroup == true) {
            return true;
        }

        return false;
    }

    showMobilePicker(e) {
        var opts = this.getOptions();
        var selectedItems = this.getSelectedItems();
        var dropDown = new FilterableSelect({
            animate: true,
            elem: null,
            cancelCss: "btn",
            confirmCss: "btn btn-primary",
            cancelText: AppState.resources.cancel,
            clickEventName: "click",
            data: opts,
            filterText: AppState.resources.search + "...",
            pagingCount: 99999,
            multiselect: this.multiselect == true,
            allowExclusiveSearch: this.allowExclusiveSearch == true,
            exclusiveInclusive: this.currentExclusivity,
            autoInputFocus: !portalUtils.treatAsMobileDevice(),
            selectedIds: selectedItems.map((p) => p.id),
            formatSelection: this.formatSelection,
            formatResult: this.getFormatResult(),
            onItemSelected: (items, exclusivity) => {
                this.currentExclusivity = exclusivity;
                this.raiseChangedEvent(items, true);
                this.setMobilePickerInputText(items);
            },
        });

        dropDown.onCancel = function () {
            selectedItems = null;
            dropDown = null;
        };

        dropDown.open();
    }

    setMobilePickerInputText(items: DropdownDisplayArgs[]): void {
        var selectedText = this.getMobileSelectionText();
        var textContext = $(this.$el).find(".mbl-ddl-text") as any;
        var isPlaceholder = items.length == 0;

        if (isNullOrEmpty(selectedText)) {
            selectedText = this.placeholder;
        }

        if (isNullOrEmpty(selectedText) && this.multiselect == true) {
            selectedText = "[" + AppState.resources.all + "]";
        }

        if (this.formatResult == null) {
            textContext.attr("title", selectedText);
            textContext.text(selectedText);
        } else {
            var item: any;
            if (items != null && items.length > 0) {
                item = items[0];
            }

            var result = this.formatResult(item);
            if (result["jquery"]) {
                textContext.html("");
                textContext.append(result);
            } else {
                textContext.text(result as any);
            }
        }

        if (isPlaceholder) {
            textContext.addClass("dd-placeholder");
        } else {
            textContext.removeClass("dd-placeholder");
        }
    }

    useMobile() {
        return portalUtils.treatAsMobileDevice() && !this.tags && !portalUtils.isInIframe();
    }

    useSelect2() {
        return !this.useMobile();
    }

    useMultiCheckbxoes() {
        return this.multiselect == true && this.multiselectMode == MultiselectMode.Checkboxes;
    }

    getCurrentSelect2Data(): DropdownCurrentData {
        var selArr: DropdownDisplayArgs[] = [];
        var addArr: string[] = [];
        var cOpts = this.getOptions();
        var currData = $(this.$el).find(".make-select2")["select2"]("data");
        this.currentExclusivity = $(this.$el).find(".make-select2").data("select2").exclusivity;

        currData.forEach((item) => {
            var optItem = cOpts.filter((p) => p.id == item.id)[0];
            if (optItem != null) {
                selArr.push(optItem);
            } else if (this.tags && this.tagsAdded != null) {
                addArr.push(item.id.replaceAll(this.getSelect2AddResource(), ""));
            }
        });

        return {
            data: selArr,
            added: addArr,
        };
    }

    getSelect2AddResource(): string {
        return " (" + AppState.resources.add + ")";
    }

    bindSelect2TagsButton(select2Instance) {
        let $selection = select2Instance.$selection as JQuery<Element>;
        if ($selection.attr("data-ddbtn-bound") != "yeah") {
            let self = this;
            $selection.attr("data-ddbtn-bound", "yeah");
            $selection.on("click", ".dll-clickable-button", function (e) {
                let $this = $(this);
                let buttonIndex = $this.attr("data-index");
                let selectionData = $this.parent().parent().parent().data("data");
                let opts = self.getOptions();
                let dataItem = opts.filter((p) => p.id == selectionData.id)[0];

                (self.tagsButtons(dataItem)[buttonIndex] as DropdownListButton).clicked({
                    item: dataItem != null ? dataItem.dataRow : null,
                });

                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            });
        }
    }

    updateSelect2() {
        if (this.useSelect2()) {
            var self = this;
            var opts = this.getOptions();
            var s2Constructor = this.useMultiCheckbxoes() ? "select2MultiCheckboxes" : "select2";
            var selected = this.getSelectedItems();
            var s2Elem = this.getSelect2RootElement();
            var alreadyBound = true;

            if (s2Elem.attr("data-vebound") != "true") {
                alreadyBound = false;
                s2Elem
                    .attr("data-vebound", "true")
                    .change(function (e) {
                        if (self.skipChange) {
                            self.skipChange = false;
                            return;
                        }

                        if (self.pendingChangeTimeout != null) {
                            clearTimeout(self.pendingChangeTimeout);
                        }

                        let forceClose = false;
                        if (self.tags == true) {
                            let currentData = self.getCurrentSelect2Data();
                            if (!isNullOrEmpty(currentData.added) && self.tagsAdded != null) {
                                let eventArgs: DropdownListTagAddedArgs = {
                                    closeSelection: false,
                                    tagArr: currentData.added,
                                };

                                self.tagsAdded(eventArgs);
                                forceClose = eventArgs.closeSelection;
                            }
                        }

                        try {
                            let searchElem = DropdownSelect2Helper.getSelect2Instance(s2Elem).selection.$search[0];
                            if (searchElem != null) {
                                self.searchWasActive = searchElem == document.activeElement;
                            } else {
                                self.searchWasActive = false;
                            }
                        } catch (e) {
                            self.searchWasActive = false;
                        }

                        if (forceClose) {
                            self.searchWasActive = false;
                        }

                        if (self.changedEventDelay == null || self.changedEventDelay == 0) {
                            self.raiseChangedEvent(self.getCurrentSelect2Data().data, false);
                        } else {
                            self.pendingChangeTimeout = setTimeout(function () {
                                self.pendingChangeTimeout = null;
                                self.raiseChangedEvent(self.getCurrentSelect2Data().data, false);
                            }, self.changedEventDelay);
                        }
                    })
                    .on("select2:close", function () {
                        if (self.pendingChangeTimeout != null) {
                            clearTimeout(self.pendingChangeTimeout);
                            self.pendingChangeTimeout = null;
                            self.raiseChangedEvent(self.getCurrentSelect2Data().data, false);
                        }
                    })
                    .on("select2:opening", function (e) {
                        if ((self as any).preventOpen) {
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            e.stopPropagation();
                        }
                    })
                    .on("select2:unselect", function (e) {
                        (self as any).preventOpen = true;
                        setTimeout(() => {
                            (self as any).preventOpen = false;
                        }, 50);
                    })
                    .on("select2:selecting", function (e) {
                        if (self.trailingButton) {
                            try {
                                let clickTarget = $(e["params"].args.originalEvent.target);
                                if (clickTarget.hasClass("s2-trailing-button") || clickTarget.parent().hasClass("s2-trailing-button")) {
                                    return false;
                                }
                            } catch (e) {}
                        }
                    })
                    .on("select2:closing", function (e) {
                        if (self.trailingButton) {
                            if (self.preventDefaultTrigger == false) {
                                self.preventDefaultTrigger = null;
                            } else {
                                self.preventDefaultTimeout = setTimeout(function () {
                                    self.preventDefaultTrigger = false;
                                    s2Elem["select2"]("close");
                                }, 50);

                                return false;
                            }
                        }
                    });
            }

            let dataChanged = false;
            let optsChanged = false;
            let domOpts = s2Elem.find("option");
            let currentSelected: string[];
            let cs2v = s2Elem.val();

            //Get current state of the DOM value
            if (cs2v != null) {
                currentSelected = (this.multiselect ? cs2v : [cs2v]) as any;
            } else {
                currentSelected = [];
            }

            //Determine if value changed somehow
            if (currentSelected.length != selected.length) {
                dataChanged = true;
            } else if (currentSelected.length == 0 && selected.length == 0) {
                dataChanged = false;
            } else {
                for (let i = 0, len = selected.length; i < len; i++) {
                    let cItem = selected[i];
                    if (currentSelected.filter((p) => p == cItem.id)[0] == null) {
                        dataChanged = true;
                    }
                }
            }

            //Determine if options changed
            if (domOpts.length != opts.length) {
                optsChanged = true;
            } else if (domOpts.length == 0 && opts.length == 0) {
                optsChanged = false;
            } else {
                for (let i = 0, len = domOpts.length; i < len; i++) {
                    let domOption = domOpts[i] as HTMLOptionElement;
                    let existingOpt = opts.filter((p) => p.id == domOption.value)[0];
                    if (existingOpt == null) {
                        optsChanged = true;
                        break;
                    } else if (existingOpt.text != domOption.innerText) {
                        optsChanged = true;
                        break;
                    }
                }
            }

            //If nothing changed and the control is already bound break the operation
            if (dataChanged == false && optsChanged == false && alreadyBound) {
                return;
            }

            let allOpts = opts;
            if (this.isOptionGroupBinding()) {
                opts = this.getOptions(true);
                allOpts = [];
                (opts as unknown as DropdownOptionGroup[]).forEach((optGroup) => {
                    optGroup.children.forEach((item) => {
                        allOpts.push(item as any);
                    });
                });
            }

            allOpts.forEach((item) => {
                item["selected"] = selected.filter((p) => p.id == item.id).length > 0;
            });

            s2Elem.find("option").each((i, l) => {
                $(l).remove();
            });

            s2Elem.find("optgroup").each((i, l) => {
                $(l).remove();
            });

            var s2Args = {
                allowExclusiveSearch: this.allowExclusiveSearch == true,
                closeOnSelect: this.closeOnSelect != false && !this.useMultiCheckbxoes(),
                placeholder: this.placeholder,
                allowClear: this.placeholder != null && this.placeholder.length > 0,
                multiple: this.multiselect == true,
                dropdownAutoWidth: this.dropdownAutoWidth == true,
                tags: this.tags == true,
                data: opts,
                language: {
                    noResults: function () {
                        if (self.noResultsFound != null) {
                            self.noResultsFound();
                        }

                        return AppState.resources.noResultsFound;
                    },
                },
            };

            var formatResult = this.getFormatResult();
            if (formatResult != null) {
                s2Args["templateResult"] = formatResult;
            }

            if (this.formatSelection != null) {
                s2Args["templateSelection"] = this.formatSelection;
            }

            let modalContent = $(this.$el).closest(".modal-content");
            if (modalContent.length > 0) {
                s2Args["dropdownParent"] = modalContent;
            }

            let validTagsButtons = false;
            let tagsTemplate = this.tagsTemplate;
            if (this.tags == true && this.tagsAdded != null) {
                s2Args["createTag"] = function (params) {
                    var term = $.trim(params.term);
                    if (term === "") {
                        return null;
                    }

                    return {
                        id: term,
                        text: term + self.getSelect2AddResource(),
                        newTag: true, // add additional parameters
                    };
                };

                if (this.tagsNewPlaceLast != false) {
                    s2Args["insertTag"] = function (data, tag) {
                        // Insert the tag at the end of the results
                        data.push(tag);
                    };
                }

                if (this.tagsButtons != null) {
                    if (tagsTemplate == null && this.tagsShouldPrependContent != false && this.formatSelection == null) {
                        validTagsButtons = true;
                        tagsTemplate =
                            '<li class="select2-selection__choice select2-selection__choice-with-button"><span class="select2-selection__choice__remove" role="presentation"><i class="fas fa-times"></i></span></li>';
                        s2Args["templateSelection"] = function (state): string | JQuery {
                            if (!state) return "";
                            if (!state.id) return state.text;

                            let dataItem = allOpts.filter((p) => p.id.toString() == state.id)[0];
                            if (dataItem == null) {
                                return state.text;
                            }

                            let builder =
                                '<span class="ddl-dropdown-resultroot"><span class="ddl-dropdown-resultwrap"><span class="ddl-result-text">' + portalUtils.htmlEscape(dataItem.text) + "</span>";
                            (self.tagsButtons(dataItem) || ([] as DropdownListButton[])).forEach((button, i) => {
                                builder +=
                                    '<span class="ddl-result-button dll-clickable-button ' +
                                    button.cssClass +
                                    '" data-index="' +
                                    i +
                                    '" role="presentation"><i class="' +
                                    button.iconCss +
                                    '"></i></span>';
                            });

                            return $(builder + "</span></span>");
                        };
                    } else {
                        console.log("Skipping tagsButtons - one of required conditions not met");
                    }
                }
            }

            s2Elem[s2Constructor](s2Args);

            if (s2Args.tags) {
                if (!isNullOrEmpty(tagsTemplate)) {
                    DropdownSelect2Helper.getSelect2Instance(s2Elem).selection.selectionContainer = function () {
                        let retVal = $(tagsTemplate);
                        if (self.tagsShouldPrependContent != false) {
                            let oldAppend = retVal.append;
                            retVal.append = function (elem) {
                                retVal.prepend(elem);
                                retVal.append = oldAppend;
                            } as any;
                        }

                        return retVal;
                    };
                }

                if (this.tagsSortable == true) {
                    var ul = $(this.$el).find(".select2-container ul");
                    if (ul.length > 0) {
                        new Sortable(ul[0], {
                            animation: 150,
                            handle: ".select2-selection__choice",
                            onEnd: (evt) => {
                                const oldIndex = evt.oldIndex;
                                let newIndex = evt.newIndex;

                                if (newIndex > oldIndex) {
                                    newIndex -= 1;
                                }

                                const sel = this.currentSelected as any[];
                                if (sel == null || sel[oldIndex] == null) {
                                    return;
                                }

                                const clonedArr = sel.clone();
                                const removedItems = clonedArr.splice(oldIndex, 1);

                                console.log("oldIndex: " + oldIndex);
                                console.log("newIndex: " + newIndex);
                                console.log("removedItems: " + JSON.stringify(removedItems));

                                clonedArr.splice(newIndex, 0, removedItems[0]);

                                console.log("clonedArr: " + JSON.stringify(clonedArr));

                                this.changed(clonedArr);
                            },
                        });
                    }
                }

                // var ul = selectElem.prev('.select2-container').first('ul');
                // ul.sortable({
                //     placeholder: 'ui-state-highlight',
                //     items: 'li:not(.select2-search-field)',
                //     tolerance: 'pointer',
                //     stop: function () {
                //         onElementValueChange(element, valueAccessor, allBindingsAccessor, viewModel);
                //     }
                // });
            }

            if (this.afterBound != null) {
                this.afterBound(s2Elem, DropdownSelect2Helper.getSelect2Instance(s2Elem));
            }

            if (validTagsButtons) {
                this.bindSelect2TagsButton(DropdownSelect2Helper.getSelect2Instance(s2Elem));
            }

            if (selected.length > 0) {
                let selectedIds = selected.map((p) => p.id);
                if (self.multiselect) {
                    s2Elem.val(selectedIds);
                } else {
                    s2Elem.val(selectedIds[0]);
                }
            } else {
                s2Elem.val(null);
                s2Elem[s2Constructor]("val", "");
            }

            if (self.searchWasActive == true) {
                self.searchWasActive = false;

                this.$nextTick(() => {
                    setTimeout(() => {
                        this.focusSelect2Search();
                    }, 0);
                });
            }

            self.skipChange = true;
            s2Elem.trigger("change");
        }
    }

    getSelect2RootElement(): JQuery<Element> {
        return $(this.$el).find(".make-select2");
    }

    focusSelect2Search() {
        $(this.$el).find(".select2-search__field").focus();
    }

    mounted() {
        this.currentSelected = this.selected;
        this.updateSelect2();
        this.setMobilePickerInputText(this.getSelectedItems());
    }

    @Watch("selected")
    updateValue() {
        this.currentSelected = this.selected;
    }

    updated() {
        this.updateSelect2();
    }

    beforeDestroy() {
        try {
            $(this.$el).find(".make-select2")["select2"]("destroy");
        } catch (e) {}
    }
}

export default toNative(DropdownList);
