import Mark from "mark.js";
import { Prop, toNative } from "vue-facing-decorator";
import NotificationProvider from "../../ui/notification";
import TsxComponent, { Component } from "../../app/vuetsx";
import DropdownList, { MultiSelectExclusivity, MultiselectMode } from "../dropdown";
import CheckBox, { CheckBoxSkin } from "../input/checkbox";
import LoadingIndicator from "../loading-indicator";
import ColVisModal from "./col-vis-modal";
import TableExportModal from "./export-excel-modal";
import ColFilterModal, { ColFilterModalShowResponse } from "./filter-modal";
import ReorderProvider from "./ts/reorder";
import DropdownButtonItem from "../dropdown-button/dropdown-button-item";
import DropdownButton from "../dropdown-button/dropdown-button";
import { ButtonLayout } from "../button/button-layout";
import Button from "../button/button";
import DropdownUtils from "../../common/utils/dropdown-utils";
import { DialogResult, DialogUtils } from "../../common/dialog-utils";
import CheckboxUtils from "../../common/utils/checkbox-utils";
import DaterangePicker, { DaterangeChangedArgs } from "../input/daterange-picker";
import TimezoneHelper from "../../components/helper/timezoneHelper";
import Sortable from "sortablejs";
import "./css/datatable.css";
import { IWebApiClient, WebClientApiMethod } from "../../api/IWebClient";
import { DialogIcons } from "../../common/enums";

interface DataTableArgs {
    id: string;
    apiClient: IWebApiClient;
    apiMethod: WebClientApiMethod;
    allowMassOperations?: boolean;
    allowExport?: boolean;
    autoFetch?: boolean;
    apiArgs?: any;
    paginations?: number[];
    paginationLength?: number;
    autoFilter?: boolean;
    fullSizeTable?: boolean;
    insetTop?: boolean;
    fullSizeHasButtonBelow?: boolean;
    filterMode?: DataTableFilterMode;
    checkboxesVisible?: boolean;
    checkboxButtonsVisible?: boolean;
    topVisible?: boolean;
    bottomVisible?: boolean;
    cssClass?: string;
    columns: TableColumn[];
    buttons?: TableButton[];
    rowIndexMode?: RowIndexMode;
    fulltextPlaceholder?: string;
    skin?: DataTableSkin;
    preserveOrderBy?: boolean;
    sortableRows?: boolean;
    customAjaxCall?: (args: DataTablePostBackData) => Promise<DataTableLoadedRowset>;
    parseLoadedRowset?: (serverResp: any) => DataTableLoadedRowset;
    rowClicked?: (row: any) => void;
    rowCssClass?: (row: any) => string;
    rowCheckstateChanged?: (row: any, checked: boolean, selectedRows: any[]) => void;
    mobileBehavior?: DataTableMobileBehavior;
    mobileModeCustomRender?: (h, columns: TableColumn[], rows: any) => void;
    sortComplete?: (args: DataTableOnSortedArgs) => void;
    mobileModeRowIcon?: string;
    mobileModeShouldAutoCollapse?: boolean;
    massOperationOptions?: typeof DropdownButtonItem.prototype[];
    handleInitialFilter?: boolean;
    timezoneGmtOffset?: number;
    timezoneDstOffset?: number;
    timeFilterShiftTimezone?: boolean;
}

export interface DataTablePostBackData {
    ShowHidden: boolean;
    PaginationPosition: number;
    PaginationLength: number;
    SessionId: number;
    Filter: DataTableFilterDefinition;
    Sort: DataTableSortDefinition;
}

interface DataTableFilterDefinition {
    FullText: string;
    FilterItems: DataTablePostBackFilterItem[];
}

export interface DataTableOnSortedArgs {
    oldIndex: number;
    newIndex: number;
}

export interface DataTablePostBackFilterItem {
    PropertyName: string;
    ContainsValue?: string;
    EqualsValue?: string;
    FilterType: DataTableFilterItemType;
    NumFrom?: number;
    NumTo?: number;
    DateFrom?: DateWrapper;
    DateTo?: DateWrapper;
    ValueArr?: string[];
    ValueArrStrategy?: MultiSelectExclusivity;
}

interface DataTableSortDefinition {
    PropertyName: string;
    Direction: DataTableSortDirection;
}

export const enum DataTableFilterMode {
    Serverside = 0,
    Clientside = 1,
}

export const enum DataTableFilterItemType {
    None = 0,
    Text = 1,
    Dropdown = 2,
    DateRange = 3,
    NumericRange = 4,
}

export const enum DataTableSkin {
    Default = "default",
    Compact = "compact",
}

export const enum DataTableMobileBehavior {
    MobileLayout = "mobile",
    Compact = "compact",
    VerticalTransform = "vertical", //Do not use, shitty
}

export const enum RowIndexMode {
    Identifier = 0,
    Index = 1,
}

export interface DataTableLoadedRowset {
    TotalCount: number;
    TotalFilteredCount: number;
    Rows: any[];
}

interface StoredState {
    sortOrder: string[];
    hiddenColumns: string[];
    visibleColumns: string[];
    paginationLength: number;
    orderBy: SortDefinition;
    skin: DataTableSkin;
    mobileBehavior: DataTableMobileBehavior;
}

class RowIdentifier {
    name: string = null;
    surname: string = null;
    dtColumns: TableColumn[] = null;

    constructor(name: string, surname: string) {
        this.name = name;
        this.surname = surname;
    }

    get fullName(): string {
        return ((this.name || "") + " " + (this.surname || "")).trim();
    }
}

export const enum DataTableSortDirection {
    Ascending = 0,
    Descending = 1,
}

interface SortDefinition {
    columnId: string;
    direction: DataTableSortDirection;
}

const enum DataTableBreakpoint {
    Desktop = "desktop",
    Mobile = "mobile",
}

class StorageHelper {
    private static getStorageKey(id: string) {
        return "bldt-" + window.location.pathname.split("/").join("_") + id;
    }

    static getStoredState(id: string): StoredState {
        var retVal = localStorage.getItem(StorageHelper.getStorageKey(id));
        if (retVal != null) {
            try {
                return JSON.parse(retVal);
            } catch (e) {}
        }

        return {} as any;
    }

    static saveStoredState(id: string, state: StoredState): void {
        localStorage.setItem(StorageHelper.getStorageKey(id), JSON.stringify(state));
    }

    static storeSortOrder(id: string, sortOrder: string[]) {
        var state = StorageHelper.getStoredState(id);
        if (sortOrder != null) {
            state.sortOrder = sortOrder;
        } else if (state.sortOrder != null) {
            delete state.sortOrder;
        }

        StorageHelper.saveStoredState(id, state);
    }

    static storeOrderBy(id: string, orderBy: SortDefinition) {
        var state = StorageHelper.getStoredState(id);
        if (orderBy != null) {
            state.orderBy = orderBy;
        } else if (state.orderBy != null) {
            delete state.orderBy;
        }

        StorageHelper.saveStoredState(id, state);
    }

    static storeColVis(id: string, columns: TableColumn[]) {
        var state = StorageHelper.getStoredState(id);
        state.hiddenColumns = columns.filter((p) => p.visible == false).map((p) => p.id);
        state.visibleColumns = columns.filter((p) => p["_enforceVisible"] == true).map((p) => p.id);
        StorageHelper.saveStoredState(id, state);
    }

    static storePaginationLength(id: string, paginationLength: number) {
        var state = StorageHelper.getStoredState(id);
        state.paginationLength = paginationLength;
        StorageHelper.saveStoredState(id, state);
    }

    static storeSkin(id: string, skin: DataTableSkin) {
        var state = StorageHelper.getStoredState(id);
        state.skin = skin;
        StorageHelper.saveStoredState(id, state);
    }

    static storeMobileBehavior(id: string, mobileBehavior: DataTableMobileBehavior) {
        var state = StorageHelper.getStoredState(id);
        state.mobileBehavior = mobileBehavior;
        StorageHelper.saveStoredState(id, state);
    }
}

export interface TableColumn {
    id: string;
    caption: string;
    cssClass?: string;
    visible?: boolean;
    sortable?: boolean;
    filterType?: DataTableFilterItemType;
    filterItems?: DataTableFilterItemCollection;
    filterAllowExclusivity?: boolean;
    customFilterValue?: (row) => string;
    mobileOrder?: number;
    mobileRender?: (h, row) => void;
    mobileCaption?: boolean;
    mobileVisible?: boolean;
    mobileShouldRenderRow?: (row) => boolean;
    exportInclude?: boolean;
    exportValue?: (row) => any;
    customRender?: (h, row) => void;
    clientsideFilter?: (row: any, filterDefinition: DataTablePostBackFilterItem) => boolean;
}

export interface TableButton {
    title: string;
    icon: string;
    clicked(): void;
    childItems?: TableButtonChildItem[];
    customRender?: (h, row) => void;
}

export interface TableButtonChildItem extends TableButton {
    isSelectable?: boolean;
    isSelected?: boolean;
}

export interface DataTableFilterItem {
    id: string;
    text: string;
}

export class DataTableFilterItemCollection extends Array<DataTableFilterItem> {
    allowExclusiveSearch: boolean = false;

    constructor(allowExclusive: boolean, items: DataTableFilterItem[]) {
        super();
        this.allowExclusiveSearch = allowExclusive;
        (items || []).forEach((item) => {
            this.push(item);
        });
    }
}

export interface DataTableMethods {
    getSelectedRows<T>(): T[];
}

class DataTableMethodsImpl implements DataTableMethods {
    _ctx: DataTable;
    getSelectedRows<T>(): T[] {
        return this._ctx.getSelectedRows();
    }

    toggleCheckboxes(visible?: boolean): void {
        this._ctx.toggleCheckboxes(visible);
    }

    constructor(context: DataTable) {
        this._ctx = context;
    }
}

@Component
class TableButtonComponent extends TsxComponent<TableButton> implements TableButton {
    @Prop() title!: string;
    @Prop() icon!: string;
    @Prop() cssClass!: string;
    @Prop() clicked: () => void;
    @Prop() customRender: (h, row) => void;
    @Prop() childItems!: TableButtonChildItem[];
    randomUUID: string = "ddl-" + portalUtils.randomString(10);

    render(h) {
        if (isNullOrEmpty(this.childItems)) {
            return (
                <button class={"dt-button" + (this.cssClass != null ? " " + this.cssClass : "")} title={this.title} onClick={this.clicked}>
                    <span>
                        <i class={this.icon}></i>
                    </span>
                </button>
            );
        } else {
            return (
                <span class="nav-item dt-button dropdown">
                    <span class="dropdown-toggle" id={this.randomUUID} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class={this.icon}></i>
                    </span>
                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby={this.randomUUID}>
                        {this.childItems.map((childItem) => (
                            <a class={"dropdown-item" + (childItem.isSelectable == true ? " dropdown-selectable-section" : "")} href="javascript:" onClick={() => childItem.clicked()}>
                                <span>{childItem.title}</span>
                                {childItem.isSelected && <i class="fas fa-check"></i>}
                            </a>
                        ))}
                    </div>
                </span>
            );
        }
    }
}

@Component
class DataTable extends TsxComponent<DataTableArgs> implements DataTableArgs {
    @Prop() id!: string;
    @Prop() apiClient!: IWebApiClient;
    @Prop() apiMethod!: WebClientApiMethod;
    @Prop() allowMassOperations!: boolean;
    @Prop() allowExport!: boolean;
    @Prop() apiArgs!: any;
    @Prop() paginations?: number[];
    @Prop() paginationLengthProp!: number;
    @Prop() cssClass!: string;
    @Prop() autoFilter!: boolean;
    @Prop() insetTop!: boolean;
    @Prop() topVisible!: boolean;
    @Prop() bottomVisible!: boolean;
    @Prop() skin!: DataTableSkin;
    @Prop() preserveOrderBy!: boolean;
    @Prop() sortableRows!: boolean;
    @Prop() filterMode!: DataTableFilterMode;
    @Prop() fullSizeTable!: boolean;
    @Prop() fullSizeHasButtonBelow!: boolean;
    @Prop() mobileBehavior!: DataTableMobileBehavior;
    @Prop() mobileModeCustomRender!: (h, columns: TableColumn[], rows: any) => void;
    @Prop() mobileModeRowIcon!: string;
    @Prop() mobileModeShouldAutoCollapse!: boolean;
    @Prop() handleInitialFilter!: boolean;
    @Prop() massOperationOptions!: typeof DropdownButtonItem.prototype[];
    @Prop() checkboxesVisible!: boolean;
    @Prop() checkboxesTitle!: string;
    @Prop() checkboxButtonsVisible!: boolean;
    @Prop() rowIndexMode!: RowIndexMode;
    @Prop() fulltextPlaceholder!: string;
    @Prop() timezoneGmtOffset!: number;
    @Prop() timezoneDstOffset!: number;
    @Prop() timeFilterShiftTimezone!: boolean;
    @Prop() columns!: TableColumn[];
    @Prop() buttons!: TableButton[];
    @Prop() rowClicked: (row: any) => void;
    @Prop() rowCssClass: (row: any) => string;
    @Prop() rowCheckstateChanged: (row: any, checked: boolean, selectedRows: any[]) => void;
    @Prop() parseLoadedRowset?: (serverResp: any) => DataTableLoadedRowset;
    @Prop() customAjaxCall?: (args: DataTablePostBackData) => Promise<DataTableLoadedRowset>;
    @Prop() sortComplete?: (args: DataTableOnSortedArgs) => void;
    @Prop() autoFetch!: boolean;
    paginationLength: number = this.paginationLengthProp ?? 50;
    paginationPosition: number = 1;
    isLoading: boolean = false;
    initialized: boolean = false;
    initDataLoaded: boolean = false;
    methods = new DataTableMethodsImpl(this);
    currentMobileBehavior: DataTableMobileBehavior = null;
    currentSkin: DataTableSkin = null;
    currentAdvancedFilterState: any = {};
    fullTextQuery: string;

    rows: any[] = [];
    loadedRows: any[];
    tableFilterTimeout: any = null;
    filterArr: DataTablePostBackFilterItem[] = [];
    sessionId: number = null;
    totalCount: number = 0;
    totalFilteredCount: number = 0;
    colSortOrder: string[] = null;
    enforceHeaderRedraw: boolean = false;
    enforceBodyRedraw: boolean = false;
    checkboxesShown: boolean = false;
    sortDefinition: SortDefinition = null;
    activeBreakPoint: DataTableBreakpoint = null;
    markInstance: any = null;

    mounted(): void {
        this.checkboxesShown = this.checkboxesVisible == true;
        this.currentSkin = this.skin;
        this.currentMobileBehavior = this.mobileBehavior;
        this.performColumnRefresh();
        this.onWindowResized();
        this.markInstance = new Mark(this.$el);
        window.addEventListener("resize", this.onWindowResized, true);

        if (this.handleInitialFilter) {
            this.parseInitialFilter();
        }

        if (this.fullSizeTable) {
            let htmlElem = $("html");
            htmlElem.addClass("has-dt-fullsize");

            if (portalUtils.treatAsMobileDevice()) {
                htmlElem.addClass("has-dt-fullsize-mobile");
            }
            if (portalUtils.isIOS()) {
                htmlElem.addClass("has-dt-fullsize-ios");
            }
        }

        if (this.sortableRows == true) {
            this.initRowSortable();
        }

        if (this.autoFetch != false) {
            setTimeout(async () => {
                this.loadInitialData();
            }, 300);
        } else {
            this.initialized = true;
        }
    }

    updated(): void {
        if (this.autoFetch != false) {
            this.loadInitialData();
        } else {
            this.initialized = true;
        }
    }

    beforeDestroy(): void {
        if (this.fullSizeTable) {
            this.removeFullsizeModeLayoutCssClass();

            $("html").removeClass("has-dt-fullsize").removeClass("has-dt-fullsize-mobile").removeClass("has-dt-fullsize-ios");
        }

        window.removeEventListener("resize", this.onWindowResized, true);
    }

    loadInitialData(): void {
        if (this.apiArgs == null) {
            return;
        }

        if (!this.initialized && !this.initDataLoaded) {
            this.initDataLoaded = true;
            var self = this;
            this.reloadDataPromise().then(() => {
                setTimeout(() => {
                    this.initialized = true;
                }, 1);
            });
        }
    }

    parseInitialFilter(): void {
        let self = this;
        let filterBy = QueryStringUtils.getString("filterBy");
        let orderBy = QueryStringUtils.getString("orderBy");
        let getColumn = function (id: string) {
            let column = self.columns.filter((p) => p.id == id)[0];
            if (column == null && id.toLowerCase() == "name") {
                column = self.columns.filter((p) => p["customField"] != null && p["customField"].MappingType == 1)[0];
            }

            if (column == null && id.toLowerCase() == "surname") {
                column = self.columns.filter((p) => p["customField"] != null && p["customField"].MappingType == 2)[0];
            }

            return column;
        };

        let getParamArr = function (val: string): Array<Array<string>> {
            let arrOfArr: Array<Array<string>>;
            try {
                arrOfArr = JSON.parse(val);
            } catch (e) {}

            if (arrOfArr == null) {
                return null;
            }

            if (arrOfArr.length && arrOfArr.splice) {
                if (portalUtils.isString(arrOfArr[0])) {
                    arrOfArr = [arrOfArr as any];
                }

                return arrOfArr;
            }

            return null;
        };

        if (!isNullOrEmpty(filterBy)) {
            let arrOfArr = getParamArr(filterBy);

            if (!isNullOrEmpty(arrOfArr)) {
                arrOfArr.forEach((pair) => {
                    let column = getColumn(pair[0]);
                    if (column != null) {
                        if (column.filterType == null || column.filterType == DataTableFilterItemType.Text) {
                            this.addFilterItem(column, {
                                PropertyName: column.id,
                                ContainsValue: pair[1],
                                FilterType: DataTableFilterItemType.Text,
                            });
                        } else if (column.filterType == DataTableFilterItemType.Dropdown) {
                            this.addFilterItem(column, {
                                PropertyName: column.id,
                                ValueArr: [pair[1]],
                                ValueArrStrategy: MultiSelectExclusivity.Exclusive,
                                FilterType: DataTableFilterItemType.Dropdown,
                            });
                        }
                    }
                });
            }
        }

        if (!isNullOrEmpty(orderBy)) {
            let arrOfArr = getParamArr(orderBy);

            if (!isNullOrEmpty(arrOfArr)) {
                arrOfArr.forEach((pair) => {
                    let column = getColumn(pair[0]);
                    if (column != null) {
                        this.sortDefinition = {
                            columnId: column.id,
                            direction: pair[1] == "desc" ? DataTableSortDirection.Descending : DataTableSortDirection.Ascending,
                        };
                    }
                });
            }
        }
    }

    async ensureMassPaginationConsent(): Promise<DialogResult> {
        let selectedCount = this.getSelectedRows().length;
        let paginationLength = this.getPaginationLength();
        if (paginationLength < 0) {
            return DialogResult.Confirm;
        }

        if (this.totalCount < paginationLength) {
            return DialogResult.Confirm;
        }

        if (selectedCount < paginationLength - 7) {
            return DialogResult.Confirm;
        }

        let continueLabel = AppState.resources.continue + '&nbsp;&nbsp;<i class="icon icon-arrow-right-circle"></i>';
        let messageHtml = AppState.resources.dtMassOperationWarningText.format(selectedCount, this.totalCount);
        let dialogResult = await DialogUtils.showConfirmDialog(AppState.resources.warning, messageHtml, continueLabel, AppState.resources.cancel, DialogIcons.Warning);
        return dialogResult;
    }

    performColumnRefresh(): void {
        var savedState = StorageHelper.getStoredState(this.id);
        this.colSortOrder = savedState.sortOrder;
        this.handleColumnsVisibility(savedState, this.columns);
        this.paginationLength = savedState.paginationLength;

        if (savedState.skin != null) {
            this.currentSkin = savedState.skin;
        }

        if (savedState.mobileBehavior != null) {
            this.currentMobileBehavior = savedState.mobileBehavior;
        }

        if (savedState.orderBy != null) {
            this.sortDefinition = savedState.orderBy;
        }
    }

    initRowSortable(): void {
        let args = {
            animation: 150,
            handle: ".dt-col-index",
            onEnd: (evt) => {
                this.sortComplete(evt);
            },
        } as any;

        this.$nextTick(() => {
            this.$nextTick(() => {
                new Sortable(this.$el.querySelector("tbody"), args);
            });
        });
    }

    reorderColumns(sortOrder: string[], columns: TableColumn[]): void {
        if (sortOrder != null && sortOrder.length >= columns.length) {
            var sorted = [];
            var allFound = true;

            if (sortOrder.length == columns.length) {
                sortOrder.forEach((propName) => {
                    var ci = columns.filter((p) => p.id == propName)[0];
                    if (ci != null) {
                        sorted.push(ci);
                    } else {
                        allFound = false;
                    }
                });
            }

            if (!allFound) {
                StorageHelper.storeSortOrder(this.id, null);
                sortOrder = null;
            } else {
                columns.splice(0, columns.length);
                sorted.forEach((sortedCol) => {
                    columns.push(sortedCol);
                });
            }
        }
    }

    onWindowResized(): void {
        var width = window.innerWidth;
        var breakpointMode = width > 767 ? DataTableBreakpoint.Desktop : DataTableBreakpoint.Mobile;

        if (breakpointMode != this.activeBreakPoint) {
            this.activeBreakPoint = breakpointMode;
            this.onMobileBreakpointChanged();
        }
    }

    onMobileBreakpointChanged() {
        if (this.fullSizeTable && portalUtils.treatAsMobileDevice()) {
            this.removeFullsizeModeLayoutCssClass();
            $("html").addClass("dt-fullsize-beh-" + this.getMobileBehavior());
            $("html").addClass("dt-fullsize-skin-" + this.getSkin());
        }
    }

    removeFullsizeModeLayoutCssClass() {
        if (this.fullSizeTable && portalUtils.treatAsMobileDevice()) {
            $("html")
                .removeClass("dt-fullsize-beh-" + DataTableMobileBehavior.Compact)
                .removeClass("dt-fullsize-beh-" + DataTableMobileBehavior.MobileLayout)
                .removeClass("dt-fullsize-beh-" + DataTableMobileBehavior.VerticalTransform)
                .removeClass("dt-fullsize-skin-" + DataTableSkin.Default)
                .removeClass("dt-fullsize-skin-" + DataTableSkin.Compact);
        }
    }

    handleColumnsVisibility(savedState: StoredState, columns: TableColumn[]): void {
        if (savedState.hiddenColumns != null) {
            savedState.hiddenColumns.forEach((hc) => {
                var colItem = columns.filter((p) => p.id == hc)[0];
                if (colItem != null) {
                    colItem.visible = false;

                    if (colItem["_enforceVisible"] != null) {
                        delete colItem["_enforceVisible"];
                    }
                }
            });
        }

        if (savedState.visibleColumns != null) {
            savedState.visibleColumns.forEach((vc) => {
                var colItem = columns.filter((p) => p.id == vc)[0];
                if (colItem != null) {
                    colItem.visible = true;
                    colItem["_enforceVisible"] = true;
                }
            });
        }
    }

    getPaginationLength(): number {
        return this.paginationLength || 50;
    }

    getTableColumnHeaderCssClass(column: TableColumn, index: number): string {
        return "dt-header-" + column.id.split(":").join("_").toLowerCase() + " dt-header-i" + index + " " + (column.cssClass || "") + (column.sortable == false ? " dt-header-notsortable" : "");
    }

    getTableColumnHeaderFilterCssClass(column: TableColumn, index: number): string {
        return "header-filter-cell dt-filter-" + column.id.split(":").join("_").toLowerCase() + " dt-filter-i" + index + " dt-filtertype-" + this.getFilterTypeName(column.filterType);
    }

    getTableItemCssClass(column: TableColumn, index: number): string {
        return "dt-col-" + column.id.split(":").join("_").toLowerCase() + " dt-col-i" + index + " " + (column.cssClass || "");
    }

    getFilterTypeName(filterType: DataTableFilterItemType): string {
        switch (filterType) {
            case DataTableFilterItemType.None:
                return "none";

            case null:
            case undefined:
            case DataTableFilterItemType.Text:
                return "text";

            case DataTableFilterItemType.Dropdown:
                return "dropdown";

            case DataTableFilterItemType.DateRange:
                return "daterange";

            case DataTableFilterItemType.NumericRange:
                return "numericrange";

            default:
        }
    }

    getRowIdProp(row: any): string {
        if (row?.Id != null) {
            return "Id";
        }

        return "id";
    }

    getRowId(row: any): number {
        return row[this.getRowIdProp(row)];
    }

    getSelectedRows(): any[] {
        var self = this;
        var selectedRows = [];

        if (isNullOrEmpty(self.rows)) {
            return [];
        }

        const rowIdProp = this.getRowIdProp(self.rows[0]);

        $(".dt-selection-checkbox input:checked").each(function (this: any) {
            var rowId = Number($(this).closest(".dt-selection-checkbox").attr("data-id"));
            var existingRow = selectedRows.filter((p) => p[rowIdProp] == rowId)[0];

            if (existingRow == null) {
                var selectedRow = self.rows.filter((p) => p[rowIdProp] == rowId)[0];
                if (selectedRow != null) {
                    selectedRows.push(selectedRow);
                }
            }
        });

        return selectedRows;
    }

    markSelection(): void {
        var mySelf = this;
        var escapeRegExp = function (string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
        };

        var getValueArr = function (filterItem: DataTablePostBackFilterItem): string[] {
            if (!isNullOrEmpty(filterItem.EqualsValue)) {
                return [filterItem.EqualsValue];
            } else if (!isNullOrEmpty(filterItem.ContainsValue)) {
                return [filterItem.ContainsValue];
            } else if (!isNullOrEmpty(filterItem.ValueArr)) {
                return [];
                //return filterItem.ValueArr;
            }
        };

        var regexBuilder = "";
        if (this.filterArr != null) {
            this.filterArr.forEach((filterItem) => {
                if (regexBuilder.length > 0) {
                    regexBuilder += "|";
                }

                getValueArr(filterItem).forEach((filterValue) => {
                    regexBuilder += escapeRegExp(filterValue);
                });
            });
        }

        if (!isNullOrEmpty(this.fullTextQuery)) {
            regexBuilder += escapeRegExp(this.fullTextQuery);
        }

        this.markInstance.unmark({
            done: function () {
                mySelf.markInstance.markRegExp(new RegExp("(" + regexBuilder + ")", "i"));
            },
        });
    }

    addFilterItem(dtColumn: TableColumn, newFilter: DataTablePostBackFilterItem): void {
        var existingItem = this.filterArr.filter((p) => p.PropertyName == dtColumn.id)[0];
        var hasValue =
            !isNullOrEmpty(newFilter.ContainsValue) ||
            !isNullOrEmpty(newFilter.EqualsValue) ||
            !isNullOrEmpty(newFilter.ValueArr) ||
            newFilter.DateFrom != null ||
            newFilter.DateTo != null ||
            newFilter.NumFrom != null ||
            newFilter.NumTo != null;

        if (existingItem == null && hasValue) {
            this.filterArr.push(newFilter);
            return;
        }

        this.filterArr.remove(existingItem);
        if (existingItem != null && hasValue) {
            this.filterArr.push(newFilter);
        }
    }

    filterDataHaveChanged(dtColumn: TableColumn, filterItem: DataTablePostBackFilterItem): boolean {
        var currentData: DataTablePostBackFilterItem = this.filterArr.filter((p) => p.PropertyName == dtColumn.id)[0] || ({} as any);
        return JSON.stringify(currentData) != JSON.stringify(filterItem);
    }

    performFullTextSearch(e): void {
        if (this.tableFilterTimeout != null) {
            clearTimeout(this.tableFilterTimeout);
        }

        this.fullTextQuery = e.target.value;

        e = e ? e : window.event;
        var charCode: number = -1;
        if (e.which) {
            charCode = e.which;
        } else if (e.keyCode) {
            charCode = e.keyCode;
        }

        if (charCode == 13) {
            this.reloadData();
        } else {
            this.tableFilterTimeout = setTimeout(() => {
                this.reloadData();
            }, 750);
        }
    }

    performInputFilter(dtColumn: TableColumn, e): void {
        if (this.tableFilterTimeout != null) {
            clearTimeout(this.tableFilterTimeout);
        }

        this.addFilterItem(dtColumn, {
            PropertyName: dtColumn.id,
            ContainsValue: e.target.value || "",
            FilterType: DataTableFilterItemType.Text,
        });

        if (this.filterMode == DataTableFilterMode.Clientside) {
            this.performClientsideFilter();
            return;
        }

        e = e ? e : window.event;
        var charCode: number = -1;
        if (e.which) {
            charCode = e.which;
        } else if (e.keyCode) {
            charCode = e.keyCode;
        }

        if (charCode == 13) {
            this.reloadData();
        } else {
            this.tableFilterTimeout = setTimeout(() => {
                this.reloadData();
            }, 750);
        }
    }

    performSelectionFilter(dtColumn: TableColumn, data: DataTableFilterItem[], exclusivity: MultiSelectExclusivity): void {
        this.currentAdvancedFilterState[dtColumn.id] = data;

        var filterValue: DataTablePostBackFilterItem = {
            PropertyName: dtColumn.id,
            ValueArr: (data || []).map((p) => p.id),
            ValueArrStrategy: exclusivity == MultiSelectExclusivity.Exclusive ? MultiSelectExclusivity.Exclusive : MultiSelectExclusivity.Inclusive,
            FilterType: DataTableFilterItemType.Dropdown,
        };

        if (!this.filterDataHaveChanged(dtColumn, filterValue)) {
            return;
        }

        if (data == null || data.length == 0) {
            this.addFilterItem(dtColumn, {} as any);
        } else {
            this.addFilterItem(dtColumn, filterValue);
        }

        if (this.filterMode == DataTableFilterMode.Clientside) {
            this.performClientsideFilter();
            return;
        }

        //Immediate reload if changed, delay handled by the Dropdown component
        this.reloadData();
    }

    performDateRangeFilter(dtColumn: TableColumn, data: DaterangeChangedArgs): void {
        this.currentAdvancedFilterState[dtColumn.id] = data;

        let startDate = data.startTime;
        let endDate = data.endTime;

        if (this.timeFilterShiftTimezone) {
            let dstOffset = this.timezoneDstOffset;
            let gmtOffset = this.timezoneGmtOffset;

            if (dstOffset == null && this.rows != null) {
                dstOffset = (this.rows.filter((p) => p["TimezoneDstOffset"] != null && p["TimezoneDstOffset"] != 0)[0] || {}).TimezoneDstOffset;
                if (dstOffset == null) {
                    dstOffset = 0;
                }
            }

            if (gmtOffset == null && this.rows != null) {
                gmtOffset = (this.rows.filter((p) => p["TimezoneGmtOffset"] != null && p["TimezoneGmtOffset"] != 0)[0] || {}).TimezoneGmtOffset;
                if (gmtOffset == null) {
                    gmtOffset = 0;
                }
            }

            startDate = TimezoneHelper.getUTCFromLocalDate(startDate, dstOffset, gmtOffset);
            endDate = TimezoneHelper.getUTCFromLocalDate(endDate, dstOffset, gmtOffset);
        }

        var filterValue: DataTablePostBackFilterItem = {
            PropertyName: dtColumn.id,
            DateFrom: startDate,
            DateTo: endDate,
            FilterType: DataTableFilterItemType.DateRange,
        };

        if (!this.filterDataHaveChanged(dtColumn, filterValue)) {
            return;
        }

        if (data == null || data.startTime == null || data.endTime == null) {
            this.addFilterItem(dtColumn, {} as any);
        } else {
            this.addFilterItem(dtColumn, filterValue);
        }

        if (this.filterMode == DataTableFilterMode.Clientside) {
            this.performClientsideFilter();
            return;
        }

        //Immediate reload if changed, delay handled by the Dropdown component
        this.reloadData();
    }

    performClientsideFilter(): void {
        this.rows = this.getClientsideFilteredAndSortedRows(this.loadedRows);
    }

    getClientsideFilteredAndSortedRows(rowArr: any[]): any[] {
        let newRowArr = rowArr.clone();
        for (const filterData of this.filterArr) {
            const column = this.columns.find((p) => p.id == filterData.PropertyName);
            const filterDef = column?.clientsideFilter;

            if (filterDef != null) {
                if (!isNullOrEmpty(filterData.ContainsValue)) {
                    filterData.ContainsValue = this.normalizeStringForSearch(filterData.ContainsValue);
                }

                newRowArr = newRowArr.filter((p) => {
                    return filterDef(p, filterData);
                });

                continue;
            }

            if (filterData.FilterType == DataTableFilterItemType.Text && !isNullOrEmpty(filterData.ContainsValue)) {
                let containsVal = this.normalizeStringForSearch(filterData.ContainsValue);
                newRowArr = newRowArr.filter((p) => {
                    let val: any;
                    if (column?.customFilterValue != null) {
                        val = column.customFilterValue(p);
                    } else {
                        val = p[filterData.PropertyName];
                    }

                    if (val == null) {
                        return false;
                    }

                    if (typeof val === "string" || val instanceof String) {
                        return this.normalizeStringForSearch(val as any).contains(containsVal);
                    }

                    return this.normalizeStringForSearch((p[filterData.PropertyName] || "").toString()).contains(containsVal);
                });
            } else if (filterData.FilterType == DataTableFilterItemType.Dropdown && !isNullOrEmpty(filterData.ValueArr)) {
                newRowArr = newRowArr.filter((p) => {
                    let propVal = p[filterData.PropertyName];
                    if (propVal == null) {
                        return false;
                    }

                    if (filterData.ValueArr.length == 1) {
                        return propVal == filterData.ValueArr[0];
                    } else if (filterData.ValueArrStrategy == MultiSelectExclusivity.Inclusive) {
                        return filterData.ValueArr.contains(propVal);
                    }

                    return true;
                });
            } else if (filterData.FilterType == DataTableFilterItemType.DateRange) {
                let fromMs = filterData.DateFrom.getTime();
                let toMs = filterData.DateTo.getTime();

                newRowArr = newRowArr.filter((p) => {
                    let propVal = p[filterData.PropertyName];
                    if (propVal == null) {
                        return false;
                    }

                    try {
                        let timeMs = propVal.getTime();
                        return fromMs <= timeMs && toMs >= timeMs;
                    } catch (error) {
                        return false;
                    }
                });
            } else if (filterData.FilterType == DataTableFilterItemType.NumericRange) {
                newRowArr = newRowArr.filter((p) => {
                    let propVal = p[filterData.PropertyName];
                    if (propVal == null) {
                        return false;
                    }

                    return filterData.NumFrom <= propVal && filterData.NumTo >= propVal;
                });
            }
        }

        if (!isNullOrEmpty(this.fullTextQuery)) {
            const fulltextArr: any[] = [];
            const normalizedQuery = this.normalizeStringForSearch(this.fullTextQuery);

            for (const row of newRowArr) {
                for (let propName in row) {
                    const column = this.columns.find((p) => p.id == propName);
                    let propVal: any;

                    if (column?.customFilterValue != null) {
                        propVal = column.customFilterValue(row);
                    } else {
                        propVal = row[propName];
                    }

                    if (propVal != null) {
                        if (this.normalizeStringForSearch(propVal.toString()).contains(normalizedQuery)) {
                            fulltextArr.push(row);
                            break;
                        }
                    }
                }
            }

            newRowArr = fulltextArr;
        }

        if (this.sortDefinition != null) {
            const colId = this.sortDefinition.columnId;
            type SORT_TYPE_OPTS = "string" | "date" | "unknown";
            let sortType: SORT_TYPE_OPTS = "unknown";

            for (const row of newRowArr) {
                const item = row[colId];
                if (item == null) {
                    continue;
                }

                if (typeof item === "string" || item instanceof String) {
                    sortType = "string";
                } else if (item.getTime != null && item.getSeconds != null) {
                    sortType = "date";
                } else {
                    sortType = "unknown";
                }

                break;
            }

            if (sortType == "string") {
                const collator = new Intl.Collator(AppState.currentLanguageCode, {
                    numeric: true,
                    sensitivity: "base",
                });
                newRowArr = newRowArr.sort((a, b) => collator.compare(a[colId], b[colId]));
            } else if (sortType == "date") {
                newRowArr = newRowArr.sort((a, b) => {
                    return (b[colId]?.getTime() || 0) - (a[colId]?.getTime() || 0);
                });
            } else {
                try {
                    newRowArr = newRowArr.sortBy(this.sortDefinition.columnId);
                } catch (error) {}
            }

            if (this.sortDefinition.direction == DataTableSortDirection.Descending) {
                newRowArr = newRowArr.reverse();
            }
        }

        return newRowArr;
    }

    normalizeStringForSearch(str: string): string {
        return str.toLowerCase().latinize().trim();
    }

    reloadData(): void {
        this.reloadDataPromise()
            .then(function (data) {})
            .catch(function (err) {});
    }

    reloadDataPromise(paginationPosition?: number, paginationLength?: number): Promise<any> {
        var mySelf = this;
        this.isLoading = true;

        return new Promise(function (resolve, reject) {
            let loadPromise: Promise<any>;
            if (mySelf.customAjaxCall == null) {
                loadPromise = mySelf.apiClient[mySelf.apiMethod](mySelf.getAjaxArgs(paginationPosition, paginationLength));
            } else {
                loadPromise = mySelf.customAjaxCall(mySelf.getAjaxArgs(paginationPosition, paginationLength));
            }

            loadPromise
                .then((data: any) => {
                    mySelf.markInstance.unmark({
                        done: function () {
                            mySelf.enforceBodyRedraw = true;
                            mySelf.$nextTick(() => {
                                mySelf.enforceBodyRedraw = false;
                                mySelf.isLoading = false;

                                if (mySelf.parseLoadedRowset != null) {
                                    let rowset = mySelf.parseLoadedRowset(data);
                                    mySelf.totalCount = rowset.TotalCount;
                                    mySelf.totalFilteredCount = rowset.TotalFilteredCount;
                                    mySelf.rows = rowset.Rows;
                                } else {
                                    mySelf.totalCount = data.TotalCount;
                                    mySelf.totalFilteredCount = data.TotalFilteredCount;
                                    mySelf.rows = data.Rows;
                                }

                                mySelf.loadedRows = mySelf.rows;
                                mySelf.$forceUpdate();
                                mySelf.$nextTick(() => mySelf.markSelection());
                                resolve(data);
                            });
                        },
                    });
                })
                .catch((err) => {
                    mySelf.isLoading = false;
                    NotificationProvider.showErrorMessage(AppState.resources.errorFetchingData);
                    reject(err);
                });
        });
    }

    getAjaxArgs(paginationPosition?: number, paginationLength?: number): DataTablePostBackData {
        if (this.sessionId == null) {
            this.sessionId = Math.floor(Math.random() * 2147483647) + 2147483647 * -1;
        }

        var dataArgs = {} as any as DataTablePostBackData;
        if (this.apiArgs != null) {
            for (let key in this.apiArgs) {
                var kv = this.apiArgs[key];
                if (kv && {}.toString.call(kv) === "[object Function]") {
                    dataArgs[key] = kv.call(this);
                } else {
                    dataArgs[key] = kv;
                }
            }
        }

        dataArgs.SessionId = this.sessionId;
        dataArgs.PaginationPosition = paginationPosition || this.paginationPosition;
        dataArgs.PaginationLength = paginationLength || this.getPaginationLength();
        dataArgs.Filter = {
            FullText: this.fullTextQuery,
            FilterItems: this.filterArr,
        };

        if (this.sortDefinition != null) {
            dataArgs.Sort = {
                PropertyName: this.sortDefinition.columnId,
                Direction: this.sortDefinition.direction,
            };
        }

        if (dataArgs.PaginationLength == -1) {
            dataArgs.PaginationPosition = 1;
        }

        return dataArgs;
    }

    isMobileModeRenderType(): boolean {
        return this.activeBreakPoint == "mobile" && this.getMobileBehavior() == DataTableMobileBehavior.MobileLayout;
    }

    forceHeaderRedraw(): void {
        this.enforceHeaderRedraw = true;
        this.$nextTick(() => (this.enforceHeaderRedraw = false));
    }

    forceBodyRedraw(): void {
        this.enforceBodyRedraw = true;
        this.$nextTick(() => (this.enforceBodyRedraw = false));
    }

    updateRows(rowArr: any[]): void {
        this.rows = rowArr;
        this.loadedRows = rowArr;
        this.forceBodyRedraw();
    }

    setSkin(skin: DataTableSkin): void {
        StorageHelper.storeSkin(this.id, skin);
        this.currentSkin = skin;
        this.onMobileBreakpointChanged();
    }

    setMobileBehavior(mobileBehavior: DataTableMobileBehavior): void {
        StorageHelper.storeMobileBehavior(this.id, mobileBehavior);
        this.currentMobileBehavior = mobileBehavior;
        this.onMobileBreakpointChanged();
    }

    onColumnsReordered(sortOrder: string[]): void {
        sortOrder = sortOrder.filter((p) => p != "_sysIndexCol");
        StorageHelper.storeSortOrder(this.id, sortOrder);
        this.colSortOrder = sortOrder;
        this.reorderColumns(sortOrder, this.getVisibleColumns());
        this.forceHeaderRedraw();
    }

    async onColumnHeaderClicked(dtColumn: TableColumn) {
        if (dtColumn.sortable == false) {
            return;
        }

        var oldDef = this.sortDefinition;
        var newDirection = DataTableSortDirection.Ascending;
        if (this.sortDefinition != null && this.sortDefinition.columnId == dtColumn.id && this.sortDefinition.direction == DataTableSortDirection.Ascending) {
            newDirection = DataTableSortDirection.Descending;
        }

        this.sortDefinition = {
            columnId: dtColumn.id,
            direction: newDirection,
        };

        if (this.preserveOrderBy == true) {
            StorageHelper.storeOrderBy(this.id, this.sortDefinition);
        }

        if (this.filterMode == DataTableFilterMode.Clientside) {
            this.performClientsideFilter();
            return;
        }

        try {
            await this.reloadDataPromise();
        } catch (e) {
            this.sortDefinition = oldDef;
        }
    }

    onColumnVisibilityChanged(columns: TableColumn[]): void {
        StorageHelper.storeColVis(this.id, columns);
        this.forceHeaderRedraw();
    }

    onColumnModalFilterChanged(e: ColFilterModalShowResponse): void {
        if (e.changed) {
            this.filterArr = e.filterArr;
            this.reloadData();
        }
    }

    onMobileRowClicked(e: any, row: any) {
        if (this.checkboxesShown) {
            var target = $(e.target);
            if (!target.hasClass("dt-mobile-row-inner")) {
                target = target.closest(".dt-mobile-row-inner");
            }

            var input = target.find(".dt-selection-checkbox input")[0] as HTMLInputElement;
            input.checked = !input.checked;
        }

        if (this.rowClicked) {
            this.rowClicked(row);
        }
    }

    onRowCheckboxChanged(row: any, checked: boolean) {
        if (this.rowCheckstateChanged != null) {
            this.rowCheckstateChanged(row, checked, this.getSelectedRows());
        }
    }

    getLastPaginationIndex(): number {
        var retVal = this.totalFilteredCount / this.getPaginationLength();
        if (retVal % this.getPaginationLength() != 0) {
            retVal = Math.floor(retVal) + 1;
        }

        if (retVal == 0) {
            retVal = 1;
        }

        return retVal;
    }

    async onPaginationPositionChanged(newValue: number): Promise<any> {
        if (this.paginationPosition == newValue || newValue < 1 || newValue > this.getLastPaginationIndex()) {
            return;
        }

        await this.reloadDataPromise(newValue);
        this.paginationPosition = newValue;
    }

    async onPaginationLengthChanged(newValue: number) {
        if (this.getPaginationLength() == newValue) {
            return;
        }

        await this.reloadDataPromise(null, newValue);
        StorageHelper.storePaginationLength(this.id, newValue);
        this.paginationLength = newValue;
    }

    onCheckAllChanged(checked: boolean): void {
        $(".dt-col-indexcheckbox").each(function (this: HTMLElement) {
            $(this).find("input").prop("checked", checked);
        });

        this.onRowCheckboxChanged(null, null);
    }

    getNameAndSurnameIndex(name: string, surname: string): string {
        var retVal: string;
        if ((name != null && name.length > 0) || (surname != null && surname.length > 0)) {
            name = name || "";
            surname = surname || "";

            if (name.length > 0) {
                if (surname.length > 0) {
                    retVal = name.substring(0, 1).toUpperCase() + surname.substring(0, 1).toUpperCase();
                } else {
                    retVal = name;
                }
            } else {
                retVal = surname;
            }
        }

        return retVal;
    }

    getRowIdentifier(columns: TableColumn[], row: any, includeColumns: boolean): RowIdentifier {
        var namingData: RowIdentifier;
        if (row.CustomFields != null) {
            let nameCf = (row.CustomFields.filter((p) => p.MappingType == 1)[0] || {}) as any;
            let surnameCf = (row.CustomFields.filter((p) => p.MappingType == 2)[0] || {}) as any;
            namingData = new RowIdentifier(nameCf.Value, surnameCf.Value);

            if (includeColumns && namingData.fullName.length > 1) {
                namingData.dtColumns = [];

                let nameCol = columns.filter((p) => p.id.indexOf("cf:map:" + 1) > -1 || p.id.indexOf("cf:id:" + nameCf.Id) > -1)[0];
                if (nameCol != null) {
                    namingData.dtColumns.push(nameCol);
                }

                let surnameCol = columns.filter((p) => p.id.indexOf("cf:map:" + 2) > -1 || p.id.indexOf("cf:id:" + surnameCf.Id) > -1)[0];
                if (surnameCol != null) {
                    namingData.dtColumns.push(surnameCol);
                }
            }
        }

        if (namingData == null || (namingData.fullName.length < 2 && row.Name != null)) {
            namingData = new RowIdentifier(row.Name, row.Surname);

            if (includeColumns) {
                namingData.dtColumns = [];

                let nameCol = columns.filter((p) => p.id == "Name")[0];
                if (nameCol != null) {
                    namingData.dtColumns.push(nameCol);
                }

                let surnameCol = columns.filter((p) => p.id == "Surname")[0];
                if (surnameCol != null) {
                    namingData;
                }
            }
        }

        if (namingData == null || (namingData.fullName.length < 2 && row.Email != null)) {
            if (row.Email != null) {
                namingData = new RowIdentifier(row.Email, "");

                if (includeColumns) {
                    let emailCol = columns.filter((p) => p.id == "Email")[0];
                    if (emailCol != null) {
                        namingData.dtColumns = [emailCol];
                    }
                }
            }
        }

        if (namingData == null || (namingData.fullName.length < 2 && row.TicketName != null)) {
            if (row.TicketName != null) {
                namingData = new RowIdentifier(row.TicketName, "");

                if (includeColumns) {
                    let emailCol = columns.filter((p) => p.id == "TicketName")[0];
                    if (emailCol != null) {
                        namingData.dtColumns = [emailCol];
                    }
                }
            }
        }

        return namingData;
    }

    getHeaderColumnIndex(columns: TableColumn[], row, i): string {
        if (this.rowIndexMode == RowIndexMode.Index) {
            return i + 1;
        } else {
            var indexText: string;
            var rowIdentifier = this.getRowIdentifier(columns, row, false);
            if (rowIdentifier != null) {
                indexText = this.getNameAndSurnameIndex(rowIdentifier.name, rowIdentifier.surname);
            }

            var indexText: string;
            if (row.CustomFields != null) {
                var nameCf = row.CustomFields.filter((p) => p.MappingType == 1)[0];
                var surnameCf = row.CustomFields.filter((p) => p.MappingType == 2)[0];
                indexText = this.getNameAndSurnameIndex(nameCf != null ? nameCf.Value : "", surnameCf != null ? surnameCf.Value : "");
            }

            if (indexText != null && indexText.length > 1) {
                if (indexText.length > 2) {
                    var splitArr = indexText.split(" ");
                    if (splitArr.length > 1) {
                        indexText = (splitArr[0].substring(0, 1) + splitArr[1].substring(0, 1)).toUpperCase();
                    } else {
                        indexText = indexText.substring(0, 2).toUpperCase();
                    }
                }
            } else {
                indexText = (i + 1).toString();
            }

            return indexText;
        }
    }

    showColVis(): void {
        (this.$refs.colVisModal as typeof ColVisModal.prototype).methods.show();
    }

    showFilterModal(): void {
        (this.$refs.colFilterModal as typeof ColFilterModal.prototype).methods.show({
            filterArr: this.filterArr,
        });
    }

    exportExcel(): void {
        (this.$refs.tableExportModal as typeof TableExportModal.prototype).methods.show({
            apiClient: this.apiClient,
            apiMethod: this.apiMethod,
            apiArgs: this.getAjaxArgs(),
            columns: this.columns,
            rows: this.rows,
            paginationLength: this.getPaginationLength(),
            totalFilteredCount: this.totalFilteredCount,
        });
    }

    toggleCheckboxes(visible?: boolean): void {
        if (visible == null) {
            visible = !this.checkboxesShown;
        }

        this.checkboxesShown = visible;
    }

    getSkin(): DataTableSkin {
        return this.currentSkin || DataTableSkin.Default;
    }

    getMobileBehavior(): DataTableMobileBehavior {
        return this.currentMobileBehavior || DataTableMobileBehavior.MobileLayout;
    }

    getVisibleColumns(): TableColumn[] {
        var state = StorageHelper.getStoredState(this.id);
        var colArr = this.columns.filter((p) => p.visible != false);
        this.reorderColumns(this.colSortOrder, colArr);
        this.handleColumnsVisibility(state, colArr);
        return colArr;

        //return this.columns.filter(p => p.visible != false);
    }

    isDesiredCustomFieldColumn(dtCol: TableColumn, row: any, mappingType: any): boolean {
        var nameCf = row.CustomFields.filter((p) => p.MappingType == mappingType)[0];
        if (nameCf != null && (dtCol.id.contains("id:" + nameCf.Id) || dtCol.id.contains("map:" + nameCf.MappingType))) {
            return true;
        }

        return false;
    }

    getTableColumnOrder(dtCol: TableColumn, row: any): number {
        if (dtCol.mobileOrder != null) {
            return dtCol.mobileOrder;
        }

        if (dtCol.id.indexOf("cf:") > -1 && row.CustomFields != null) {
            if (this.isDesiredCustomFieldColumn(dtCol, row, 1)) {
                return -10100;
            }

            if (this.isDesiredCustomFieldColumn(dtCol, row, 1)) {
                return -10000;
            }
        }

        if (dtCol.id == "Name") {
            return -9000;
        }

        if (dtCol.id == "TicketName") {
            return -8900;
        }

        return null;
    }

    getTableColumnOrderStyle(dtCol: TableColumn, row: any): string {
        var retVal = this.getTableColumnOrder(dtCol, row);
        if (retVal != null) {
            return "order:" + retVal;
        }

        return null;
    }

    getMassOperationItems(): typeof DropdownButtonItem.prototype[] {
        return this.massOperationOptions || [];
    }

    shouldRenderMobileRowColumn(row, dtColumn: TableColumn): boolean {
        if (dtColumn.customRender == null) {
            return row[dtColumn.id] != null;
        }

        if (dtColumn.mobileShouldRenderRow) {
            return dtColumn.mobileShouldRenderRow(row);
        }

        return true;
    }

    render(h) {
        var columns = this.getVisibleColumns();
        var paginationStart = (this.paginationPosition - 1) * this.getPaginationLength() + 1;
        var paginationEnd = Math.min(paginationStart + this.getPaginationLength(), this.totalFilteredCount) - 1;
        let settingsUUID = "ddl-" + portalUtils.randomString(10);
        let isMobile = portalUtils.treatAsMobileDevice();
        let hasMobLayout = this.getMobileBehavior() == DataTableMobileBehavior.MobileLayout;
        let hasTableSkin = this.getSkin() == DataTableSkin.Default;

        if (this.paginationPosition == this.getLastPaginationIndex()) {
            paginationEnd += 1;
        }

        if (this.totalFilteredCount == 0) {
            paginationStart = 0;
            paginationEnd = 0;
        }

        if (this.getPaginationLength() == -1) {
            paginationEnd = this.totalFilteredCount;
        }

        return (
            <div
                class={
                    "dt-root dt-mobile-mobile dt-device-" +
                    (portalUtils.treatAsMobileDevice() ? "mobile" : "desktop") +
                    (portalUtils.isIOS() ? " dt-ios" : "") +
                    " dt-skin-" +
                    this.getSkin() +
                    " dt-mobbehavior-" +
                    this.getMobileBehavior() +
                    (this.checkboxesShown ? " dt-checkboxes-visible" : "") +
                    " dt-breakpoint-" +
                    this.activeBreakPoint +
                    (this.fullSizeHasButtonBelow ? " dt-fs-buttonsbelow" : "") +
                    (this.insetTop ? " dt-inset-top" : "") +
                    (this.fullSizeTable == true ? " dt-fullsize-table" : "") +
                    " " +
                    (this.cssClass || "")
                }
            >
                {this.topVisible != false && (
                    <div class="dt-top">
                        <div class="dt-top-buttonsrow">
                            <div class="dt-buttons">
                                <TableButtonComponent title={AppState.resources.colVisLabel} icon={"fa fa-eye-slash"} clicked={() => this.showColVis()} />

                                {this.buttons &&
                                    this.buttons.map((btn) => (
                                        <TableButtonComponent title={btn.title} icon={btn.icon} childItems={btn.childItems} customRender={btn.customRender} clicked={() => btn.clicked()} />
                                    ))}

                                {this.allowExport != false && <TableButtonComponent title={"Excel export"} icon={"far fa-file-excel"} clicked={() => this.exportExcel()} />}

                                {this.allowMassOperations != false && <TableButtonComponent title={this.checkboxesTitle || ""} icon={"far fa-check-square"} clicked={() => this.toggleCheckboxes()} />}

                                {this.activeBreakPoint == DataTableBreakpoint.Mobile && this.getMobileBehavior() == DataTableMobileBehavior.MobileLayout && (
                                    <TableButtonComponent title={"Filter"} icon={"fas fa-filter"} clicked={() => this.showFilterModal()} />
                                )}

                                <span class="nav-item dt-button dropdown">
                                    <span class="dropdown-toggle" id={settingsUUID} data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="fas fa-desktop"></i>
                                    </span>
                                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby={settingsUUID}>
                                        {isMobile && (
                                            <a class="dropdown-item dropdown-selectable-section" href="javascript:" onClick={() => this.setMobileBehavior(DataTableMobileBehavior.MobileLayout)}>
                                                <span>{AppState.resources.dtLayoutMobile}</span>
                                                {hasMobLayout && <i class="fas fa-check"></i>}
                                            </a>
                                        )}

                                        {!isMobile && (
                                            <a class="dropdown-item dropdown-selectable-section" href="javascript:" onClick={() => this.setSkin(DataTableSkin.Default)}>
                                                <span>{AppState.resources.dtLayoutTable}</span>
                                                {hasTableSkin && <i class="fas fa-check"></i>}
                                            </a>
                                        )}

                                        <a
                                            class="dropdown-item dropdown-selectable-section"
                                            href="javascript:"
                                            onClick={() => (isMobile ? this.setMobileBehavior(DataTableMobileBehavior.Compact) : this.setSkin(DataTableSkin.Compact))}
                                        >
                                            <span>{isMobile ? AppState.resources.dtLayoutTable : AppState.resources.dtLayoutCompact}</span>
                                            {((isMobile && !hasMobLayout) || (!isMobile && !hasTableSkin)) && <i class="fas fa-check"></i>}
                                        </a>
                                    </div>
                                </span>
                            </div>
                        </div>
                        <div class="dt-top-paginationrow">
                            {(!this.checkboxesShown || this.checkboxButtonsVisible == false) && (
                                <div class="dt-pagination-length">
                                    <select onChange={(e) => this.onPaginationLengthChanged(Number(e.target.value))}>
                                        {(this.paginations || [10, 25, 50, 100, 250, 500, 1000, -1]).map((item) => (
                                            <option value={item} selected={this.getPaginationLength() == item}>
                                                {item != -1 ? item.toString() : AppState.resources.all}
                                            </option>
                                        ))}
                                    </select>

                                    <span>{AppState.resources.recordsDtLabel}</span>
                                </div>
                            )}

                            {this.checkboxesShown && this.checkboxButtonsVisible != false && (
                                <div class="dt-pagination-length dt-massop-btn-wrap">
                                    <DropdownButton text={"Hromadne operacie"} layout={ButtonLayout.Secondary}>
                                        {this.getMassOperationItems().map((mi) =>
                                            (mi as any).isSeparator != true ? <DropdownButtonItem icon={mi.icon} text={mi.text} clicked={mi.clicked} /> : <div class="dropdown-divider" />
                                        )}

                                        <DropdownButtonItem icon="icon icon-close" text={AppState.resources.cancel} clicked={() => this.toggleCheckboxes(false)} />
                                    </DropdownButton>
                                    <Button text={AppState.resources.cancel} layout={ButtonLayout.Default} clicked={() => this.toggleCheckboxes(false)} cssClass="dt-massop-cancelbtn" />
                                </div>
                            )}

                            <div class="dt-fulltext-search">
                                <input type="search" placeholder={AppState.resources.search.capitalize() + "..."} onKeyup={(e) => this.performFullTextSearch(e)} />
                            </div>
                        </div>
                    </div>
                )}

                {this.renderTableByMode(h, columns)}

                {this.bottomVisible != false && (
                    <div class="dt-bottom">
                        <div class="dt-summary-wrap">
                            {AppState.resources.dtCountText.format(paginationStart, paginationEnd, this.totalFilteredCount)}
                            {this.totalFilteredCount != this.totalCount && (
                                <span class="dt-summary-totalcount">
                                    &nbsp;
                                    {AppState.resources.dtCountFilteredOutOf.format(this.totalCount)}
                                </span>
                            )}
                        </div>

                        <div class="dt-pagination">{this.renderPagination(h)}</div>
                    </div>
                )}

                <ColVisModal ref="colVisModal" columns={this.columns} changed={(e) => this.onColumnVisibilityChanged(e)} />
                <ColFilterModal ref="colFilterModal" columns={this.columns} changed={(e) => this.onColumnModalFilterChanged(e)} />
                <TableExportModal ref="tableExportModal" />
            </div>
        );
    }

    protected renderTableByMode(h, columns: TableColumn[]) {
        if (this.activeBreakPoint == DataTableBreakpoint.Mobile) {
            if (this.getMobileBehavior() == DataTableMobileBehavior.MobileLayout) {
                return this.renderMobileMode(h, columns);
            } else if (this.getMobileBehavior() == DataTableMobileBehavior.VerticalTransform) {
                return this.renderVerticallyTransformedTable(h, columns);
            }
        }

        return this.renderStandardTable(h, columns);
    }

    protected renderStandardTable(h, columns: TableColumn[]) {
        return (
            <div class="dt-table dt-table-mode">
                <table>
                    <LoadingIndicator visible={!this.initialized} />

                    {this.enforceHeaderRedraw == false && (
                        <thead>
                            <tr class="dt-header">
                                <th data-col-id="_sysIndexCol" class="dt-header-index">
                                    {!this.isLoading && (
                                        <span>
                                            <span class="dt-header-indexlabel" style={this.checkboxesShown ? "display:none" : ""}>
                                                #
                                            </span>
                                            <span class="dt-header-indexcheckbox" style={this.checkboxesShown ? "" : "display:none"}>
                                                <CheckBox
                                                    skin={CheckBoxSkin.Material}
                                                    label={null}
                                                    wrap={false}
                                                    value={false}
                                                    changed={(e) => {
                                                        this.onCheckAllChanged(e);
                                                    }}
                                                />
                                            </span>
                                        </span>
                                    )}

                                    {this.isLoading && <img src={portalUtils.getAssetPath("/assets/img/loading_16_16.gif")} />}
                                </th>

                                {this.renderHeaderRow(h, columns)}
                            </tr>

                            {this.autoFilter != false && (
                                <tr class="dt-header-filter">
                                    <th class="dt-filter-index"></th>

                                    {columns.map((dtColumn, i) => (
                                        <th class={this.getTableColumnHeaderFilterCssClass(dtColumn, i)}>{this.renderHeaderFilter(h, dtColumn)}</th>
                                    ))}
                                </tr>
                            )}
                        </thead>
                    )}
                    <tbody>
                        {this.rowClicked == null &&
                            this.enforceBodyRedraw == false &&
                            (this.rows || []).map((row, i) => (
                                <tr class={"dt-item" + (this.rowCssClass == null ? "" : " " + this.rowCssClass(row))}>
                                    <td class={"dt-col-index" + (this.sortableRows == true ? " dt-has-sortable-rows" : "")}>
                                        <span class="dt-col-indexlabel" style={this.checkboxesShown ? "display:none" : ""}>
                                            {this.getHeaderColumnIndex(columns, row, i)}
                                        </span>
                                        <span class="dt-col-indexcheckbox dt-selection-checkbox" data-id={this.getRowId(row)} style={this.checkboxesShown ? "" : "display:none"}>
                                            <CheckBox skin={CheckBoxSkin.Material} label={null} value={false} wrap={false} changed={(e) => this.onRowCheckboxChanged(row, e)} />
                                        </span>

                                        {this.sortableRows == true && <i class="fas fa-sort dt-sort-handle" />}
                                    </td>

                                    {columns.map((dtColumn, j) => (
                                        <td class={this.getTableItemCssClass(dtColumn, j)}>{dtColumn.customRender == null ? row[dtColumn.id] : dtColumn.customRender(h, row)}</td>
                                    ))}
                                </tr>
                            ))}

                        {this.rowClicked != null &&
                            this.enforceBodyRedraw == false &&
                            (this.rows || []).map((row, i) => (
                                <tr
                                    class={"dt-item" + (this.rowCssClass == null ? "" : " " + this.rowCssClass(row))}
                                    onClick={() => {
                                        this.rowClicked(row);
                                    }}
                                >
                                    <td class={"dt-col-index" + (this.sortableRows == true ? " dt-has-sortable-rows" : "")}>
                                        <span class="dt-col-indexlabel" style={this.checkboxesShown ? "display:none" : ""}>
                                            {this.getHeaderColumnIndex(columns, row, i)}
                                        </span>
                                        <span class="dt-col-indexcheckbox dt-selection-checkbox" data-id={this.getRowId(row)} style={this.checkboxesShown ? "" : "display:none"}>
                                            <CheckBox skin={CheckBoxSkin.Material} label={null} value={false} wrap={false} changed={(e) => this.onRowCheckboxChanged(row, e)} />
                                        </span>

                                        {this.sortableRows == true && <i class="fas fa-sort dt-sort-handle" />}
                                    </td>

                                    {columns.map((dtColumn, j) => (
                                        <td class={this.getTableItemCssClass(dtColumn, j)}>{dtColumn.customRender == null ? row[dtColumn.id] : dtColumn.customRender(h, row)}</td>
                                    ))}
                                </tr>
                            ))}

                        {this.totalFilteredCount == 0 && (
                            <tr>
                                <td class="dt-no-results" colspan="99999">
                                    <div class="dt-no-results-inner">
                                        <div>{AppState.resources.noResultsFound}</div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }

    protected renderHeaderRow(h, columns: TableColumn[]) {
        return columns.map((dtColumn, i) => (
            <th
                data-col-id={dtColumn.id}
                onMousedown={(e) =>
                    ReorderProvider.handleMouseDown(
                        e,
                        (sortOrder) => {
                            this.onColumnsReordered(sortOrder);
                        },
                        () => {
                            this.onColumnHeaderClicked(dtColumn);
                        }
                    )
                }
                onTouchstart={(e) =>
                    ReorderProvider.handleMouseDown(
                        e,
                        (sortOrder) => {
                            this.onColumnsReordered(sortOrder);
                        },
                        () => {
                            this.onColumnHeaderClicked(dtColumn);
                        }
                    )
                }
                class={this.getTableColumnHeaderCssClass(dtColumn, i)}
            >
                {dtColumn.caption}
                {this.sortDefinition && this.sortDefinition.columnId == dtColumn.id && (
                    <span class="dt-sort">
                        <i class={"fas " + (this.sortDefinition.direction == DataTableSortDirection.Ascending ? "fa-sort-up" : "fa-sort-down") + " float-right"} aria-hidden="true"></i>
                    </span>
                )}
            </th>
        ));
    }

    protected renderHeaderFilter(h, dtColumn: TableColumn) {
        var filterType = dtColumn.filterType;
        if (filterType == DataTableFilterItemType.None) {
            return "";
        } else if (filterType == DataTableFilterItemType.Text || filterType == null) {
            return (
                <input
                    class="dt-filter-input"
                    placeholder={AppState.resources.search.capitalize() + "..."}
                    onKeyup={(e) => {
                        this.performInputFilter(dtColumn, e);
                    }}
                />
            );
        } else if (filterType == DataTableFilterItemType.Dropdown) {
            return (
                <div class="dt-filter-dropdown">
                    <DropdownList
                        label={null}
                        options={dtColumn.filterItems}
                        wrap={false}
                        dropdownAutoWidth={true}
                        multiselect={true}
                        multiselectMode={MultiselectMode.Checkboxes}
                        mobileShortMode={true}
                        allowExclusiveSearch={dtColumn.filterAllowExclusivity}
                        changedEventDelay={650}
                        selected={this.currentAdvancedFilterState[dtColumn.id]}
                        changed={(changeArr, exclusivity) => {
                            this.performSelectionFilter(dtColumn, changeArr, exclusivity);
                        }}
                    />
                </div>
            );
        } else if (filterType == DataTableFilterItemType.DateRange) {
            return (
                <DaterangePicker
                    label={null}
                    cssClass={"dt-filter-input"}
                    wrap={false}
                    placeholder={AppState.resources.search.capitalize() + "..."}
                    value={this.currentAdvancedFilterState[dtColumn.id]}
                    changed={(e) => {
                        this.performDateRangeFilter(dtColumn, e);
                    }}
                />
            );
        }
    }

    protected renderVerticallyTransformedTable(h, columns: TableColumn[]) {
        return (this.rows || []).map((row, i) => (
            <div class="dt-vert-row">
                {columns.map((dtColumn, j) => (
                    <div class="dt-vert-item" style={this.getTableColumnOrderStyle(dtColumn, row)}>
                        <div class="dt-vert-caption">{dtColumn.caption}</div>
                        <div class="dt-vert-value">{dtColumn.customRender == null ? row[dtColumn.id] : dtColumn.customRender(h, row)}</div>
                    </div>
                ))}
            </div>
        ));
    }

    protected renderMobileMode(h, columns: TableColumn[]) {
        if (this.mobileModeCustomRender != null) {
            return this.mobileModeCustomRender(h, columns, this.rows);
        }

        return (
            <div class="dt-mobile-rows">
                {(this.isLoading || this.enforceBodyRedraw || this.enforceHeaderRedraw) && (
                    <div style="min-height:150px;">
                        <LoadingIndicator visible={true} />
                    </div>
                )}

                {this.enforceHeaderRedraw == false &&
                    this.enforceBodyRedraw == false &&
                    (this.rows || []).map((row, i) => (
                        <div class={"dt-mobile-row" + (this.rowCssClass == null ? "" : " " + this.rowCssClass(row))}>{this.renderMobileModeRow(h, columns, row, i)}</div>
                    ))}
            </div>
        );
    }

    protected renderMobileModeRow(h, columns: TableColumn[], row: any, i: number) {
        var identifier = this.getRowIdentifier(columns, row, true);
        var colArr = this.getVisibleColumns().filter((p) => p.mobileVisible != false);
        var cssClass = "dt-mobile-row-inner" + (this.checkboxesShown ? " dt-mobile-chbvisible" : "");

        //Exclude identifier columns if they are already picked by the engine
        if (identifier != null && identifier.dtColumns != null && identifier.dtColumns.length > 0) {
            colArr = colArr.filter((p) => identifier.dtColumns.map((c) => c.id).indexOf(p.id) == -1);
        }

        return (
            <div
                class={cssClass}
                onClick={(e) => {
                    this.onMobileRowClicked(e, row);
                }}
            >
                {this.checkboxesShown && (
                    <div class="dt-mobile-checkbox dt-selection-checkbox" data-id={this.getRowId(row)}>
                        <CheckBox skin={CheckBoxSkin.Material} label={null} wrap={false} value={null} changed={(e) => this.onRowCheckboxChanged(row, e)} />
                    </div>
                )}

                {identifier && <div class="dt-mobile-identifier">{identifier.fullName}</div>}

                {colArr.map((dtColumn, j) => (
                    <div class={"dt-mobile-item dt-mobile-" + dtColumn.id.replaceAll(":", "_").toLowerCase()} style={this.getTableColumnOrderStyle(dtColumn, row)}>
                        {dtColumn.mobileRender == null && this.shouldRenderMobileRowColumn(row, dtColumn) && (
                            <div class="dt-mobile-item-inner">
                                {dtColumn.mobileCaption != false && <div class="dt-mobile-caption">{dtColumn.caption}</div>}

                                <div class="dt-mobile-value">{dtColumn.customRender == null ? row[dtColumn.id] : dtColumn.customRender(h, row)}</div>
                            </div>
                        )}
                        {dtColumn.mobileRender && dtColumn.mobileRender(h, row)}
                    </div>
                ))}

                <i class={(this.mobileModeRowIcon || "icon icon-arrow-right") + " dt-mobile-row-icon"}></i>
            </div>
        );
    }

    protected renderPagination(h) {
        var paginationLength = 5;
        var firstIndex = Math.max(this.paginationPosition - 2, 1);
        var paginationEnd = firstIndex + paginationLength - 1;
        var indexArr = [];

        if (this.getPaginationLength() > -1) {
            if (paginationEnd > this.getLastPaginationIndex()) {
                paginationEnd = this.getLastPaginationIndex();
                firstIndex = paginationEnd - paginationLength + 1;
            }

            if (firstIndex < 1) {
                firstIndex = 1;
                paginationLength = paginationEnd - firstIndex + 1;
            }

            for (var i = firstIndex, len = paginationLength; i <= paginationEnd; i++) {
                indexArr.push(i);
            }
        } else {
            indexArr = [1];
            this.paginationPosition = 1;
        }

        return (
            <ul class="pagination">
                <li class="page-item">
                    <a class="page-link" href="javascript:" aria-label="Previous" onClick={(e) => this.onPaginationPositionChanged(this.paginationPosition - 1)}>
                        <span aria-hidden="true">
                            <i class="fa fa-angle-double-left" aria-hidden="true"></i>
                        </span>
                    </a>
                </li>

                {indexArr.map((pagIndex) => (
                    <li class={"page-item" + (pagIndex == this.paginationPosition ? " active" : "")} onClick={(e) => this.onPaginationPositionChanged(pagIndex)}>
                        <a class="page-link" href="javascript:">
                            {pagIndex}
                        </a>
                    </li>
                ))}

                <li class="page-item">
                    <a class="page-link" href="javascript:" aria-label="Next" onClick={(e) => this.onPaginationPositionChanged(this.paginationPosition + 1)}>
                        <span aria-hidden="true">
                            <i class="fa fa-angle-double-right" aria-hidden="true"></i>
                        </span>
                    </a>
                </li>
            </ul>
        );
    }

    protected renderColumnValue(h, dtColumn: TableColumn, row) {
        if (dtColumn.customRender == null) {
            return row[dtColumn.id];
        } else {
            return dtColumn.customRender(h, row);
        }
    }
}

(function () {
    CheckboxUtils.bindTableShiftClick();
    DropdownUtils.bindDropdownOverflowHack(".dt-root.dt-breakpoint-desktop tbody .dropdown", "dataTableDropdown", false);
})();

export default toNative(DataTable);
