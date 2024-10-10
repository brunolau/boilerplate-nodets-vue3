import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import Modal from "../modal/modal";
import ModalBody from "../modal/modal-body";
import ModalFooter from "../modal/modal-footer";
import Button from "../button/button";
import { ButtonLayout, ButtonSize } from "../button/button-layout";
import { TableColumn, DataTablePostBackFilterItem, DataTableFilterItemType, DataTableFilterItem } from "./datatable";
import DropdownList, { MultiselectMode, MultiSelectExclusivity } from "../dropdown";
import TextBox from "../input/textbox";

interface ColFilterModalArgs {
    columns: TableColumn[];
    changed: (e: ColFilterModalShowResponse) => void;
}

export interface ColFilterMethods {
    show: (args: ColFilterModalShowArgs) => void;
}

interface ColFilterModalShowArgs {
    filterArr: DataTablePostBackFilterItem[];
}

export interface ColFilterModalShowResponse {
    changed: boolean;
    filterArr: DataTablePostBackFilterItem[];
}

class ColFilterMethodsImpl implements ColFilterMethods {
    _ctx: ColFilterModal;
    show(args: ColFilterModalShowArgs): void {
        this._ctx.methodShow.call(this._ctx, args);
    }

    constructor(context: ColFilterModal) {
        this._ctx = context;
    }
}

@Component
class ColFilterModal extends TsxComponent<ColFilterModalArgs> implements ColFilterModalArgs, PublicMethodSet<ColFilterMethods> {
    @Prop() columns!: TableColumn[];
    @Prop() changed: (e: ColFilterModalShowResponse) => void;
    filterChanged: boolean = false;
    originalFilterArr: DataTablePostBackFilterItem[] = null;
    filterArr: DataTablePostBackFilterItem[] = null;
    methods: ColFilterMethods = new ColFilterMethodsImpl(this);

    methodShow(args: ColFilterModalShowArgs) {
        this.filterArr = (args.filterArr || []).clone();
        this.originalFilterArr = JSON.parse(JSON.stringify(this.filterArr));
        (this.$refs.colFilterDialog as typeof Modal.prototype).show();
    }

    onFilterChanged(): void {
        this.changed({
            changed: JSON.stringify(this.originalFilterArr) != JSON.stringify(this.filterArr),
            filterArr: this.filterArr,
        });
    }

    addFilterItem() {
        this.filterArr.push({
            PropertyName: this.columns[0].id,
            FilterType: DataTableFilterItemType.Text,
            ContainsValue: null,
        });
    }

    getFilterArr(): DataTablePostBackFilterItem[] {
        return this.filterArr || [];
    }

    getColumns(): TableColumn[] {
        return this.columns || [];
    }

    getColumnsForFilter(): TableColumn[] {
        return this.getColumns().filter((p) => p.filterType != DataTableFilterItemType.None);
    }

    performSelectionFilter(dtColumn: TableColumn, selected: DataTableFilterItem[], filterItem: DataTablePostBackFilterItem, exclusivity: MultiSelectExclusivity) {
        filterItem.PropertyName = dtColumn.id;
        filterItem.FilterType = DataTableFilterItemType.Dropdown;
        filterItem.ValueArrStrategy = exclusivity;
        filterItem.ValueArr = (selected || []).map((p) => p.id);
    }

    render(h) {
        return (
            <Modal ref="colFilterDialog" title={"Filter"}>
                <ModalBody>
                    {this.getFilterArr().map((filterItem) => (
                        <div>{this.renderFilterType(h, filterItem)}</div>
                    ))}

                    {this.getFilterArr().length == 0 && <div class="dt-filtermodal-noitems">{AppState.resources.dtNoMobileFilter}</div>}

                    <Button
                        icon={"icon-plus"}
                        text="Add"
                        size={ButtonSize.Small}
                        layout={ButtonLayout.Success}
                        fullWidth={true}
                        clicked={() => {
                            this.addFilterItem();
                        }}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button
                        dismissModal={true}
                        text="OK"
                        layout={ButtonLayout.Default}
                        clicked={() => {
                            this.onFilterChanged();
                        }}
                    />
                </ModalFooter>
            </Modal>
        );
    }

    renderFilterType(h, filterItem: DataTablePostBackFilterItem) {
        var dtCol = this.columns.filter((p) => p.id == filterItem.PropertyName)[0];
        if (dtCol == null) {
            return null;
        }

        return (
            <div class="dt-mobile-filter-item">
                <div class="dt-mobile-filter-rowone">
                    <DropdownList
                        wrap={false}
                        label={null}
                        options={this.getColumnsForFilter()}
                        selected={dtCol}
                        changed={(e) => {
                            dtCol = e;
                            filterItem.PropertyName = e.id;
                        }}
                        displayMember="caption"
                        valueMember="id"
                    />
                    <Button cssClass="dt-mobile-filter-remove" icon="far fa-trash-alt" text={null} layout={ButtonLayout.Danger} clicked={(e) => this.filterArr.remove(filterItem)} />
                </div>

                {(dtCol.filterType == null || dtCol.filterType == DataTableFilterItemType.Text) && (
                    <TextBox wrap={false} label={null} value={filterItem.ContainsValue} changed={(e) => (filterItem.ContainsValue = e)} placeholder={AppState.resources.searchedValue} />
                )}

                {dtCol.filterType == DataTableFilterItemType.Dropdown && (
                    <DropdownList
                        wrap={false}
                        label={null}
                        options={dtCol.filterItems}
                        dropdownAutoWidth={true}
                        multiselect={true}
                        multiselectMode={MultiselectMode.Checkboxes}
                        allowExclusiveSearch={dtCol.filterAllowExclusivity}
                        changedEventDelay={650}
                        selected={null}
                        changed={(changeArr, exclusivity) => {
                            this.performSelectionFilter(dtCol, changeArr, filterItem, exclusivity);
                        }}
                    />
                )}

                <br />
            </div>
        );
    }
}

export default toNative(ColFilterModal);
