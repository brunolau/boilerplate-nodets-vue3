import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import DataTable, { TableColumn, RowIndexMode, DataTableFilterMode, DataTableOnSortedArgs } from "./datatable";
import { IWebApiClient, WebClientApiMethod } from "../../api/IWebClient";

interface DataTableStaticArgs {
    id: string;
    columns: TableColumn[];
    rows: any[];
    fullSizeTable?: boolean;
    fullSizeHasButtonBelow?: boolean;
    topVisible?: boolean;
    allowMassOperations?: boolean;
    checkboxesVisible?: boolean;
    preserveOrderBy?: boolean;
    checkboxButtonsVisible?: boolean;
    sortableRows?: boolean;
    rowCheckstateChanged?: (row: any, checked: boolean, selectedRows: any[]) => void;
    sortComplete?: (args: DataTableOnSortedArgs) => void;
}

@Component
export class DataTableStatic extends TsxComponent<DataTableStaticArgs> implements DataTableStaticArgs, IWebApiClient {
    @Prop() id: string;
    @Prop() columns: TableColumn[];
    @Prop() rows: any[];
    @Prop() fullSizeTable: boolean;
    @Prop() fullSizeHasButtonBelow: boolean;
    @Prop() topVisible: boolean;
    @Prop() allowMassOperations: boolean;
    @Prop() checkboxesVisible!: boolean;
    @Prop() preserveOrderBy!: boolean;
    @Prop() checkboxesTitle!: string;
    @Prop() checkboxButtonsVisible!: boolean;
    @Prop() sortableRows!: boolean;
    @Prop() rowCheckstateChanged?: (row: any, checked: boolean, selectedRows: any[]) => void;
    @Prop() sortComplete?: (args: DataTableOnSortedArgs) => void;

    webClient: boolean = true;
    apiArgs: any = {};

    mounted() {
        this.reloadData();
    }

    updated() {
        this.reloadData();
    }

    exportExcel(): void {
        this.getTable().exportExcel();
    }

    normalizeStringForSearch(str: string): string {
        return this.getTable().normalizeStringForSearch(str);
    }

    private post(data: any): Promise<any> {
        let self = this;
        return new Promise(function (resolve, reject) {
            let rowArr = (self.rows || []).clone();
            if (self.preserveOrderBy == true) {
                rowArr = self.getTable().getClientsideFilteredAndSortedRows(rowArr);
            }

            resolve({
                TotalCount: rowArr.length,
                TotalFilteredCount: rowArr.length,
                Rows: rowArr,
            });
        });
    }

    private getTable(): typeof DataTable.prototype {
        return this.$refs.innerTable as typeof DataTable.prototype;
    }

    reloadData(): void {
        this.getTable().reloadData();
    }

    getSelectedRows(): any[] {
        return this.getTable().getSelectedRows();
    }

    render(h) {
        return (
            <DataTable
                id={this.id}
                ref={"innerTable"}
                apiClient={this}
                apiArgs={this.apiArgs}
                rowIndexMode={RowIndexMode.Index}
                apiMethod={WebClientApiMethod.Post}
                filterMode={DataTableFilterMode.Clientside}
                checkboxButtonsVisible={this.checkboxButtonsVisible}
                checkboxesVisible={this.checkboxesVisible}
                rowCheckstateChanged={this.rowCheckstateChanged}
                columns={this.columns}
                cssClass={"dt-static"}
                topVisible={this.topVisible == true}
                bottomVisible={false}
                allowMassOperations={this.allowMassOperations}
                fullSizeTable={this.fullSizeTable}
                sortableRows={this.sortableRows}
                sortComplete={this.sortComplete}
                preserveOrderBy={this.preserveOrderBy}
                fullSizeHasButtonBelow={this.fullSizeTable}
            />
        );
    }
}

export default toNative(DataTableStatic);
