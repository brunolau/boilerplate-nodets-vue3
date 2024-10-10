import { Prop, toNative } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";
import "./css/spreadsheet.css";

export interface SpreadsheetArgs {
    rows: any[][];
    autoTrackData?: boolean;
    allowToolbar?: boolean;
    columns: SpreadsheetColumn[];
    rootCssClass?: string;
    columnResize?: boolean;
    rowResize?: boolean;
    rowDrag?: boolean;
    columnsDrag?: boolean;
    nestedHeaders?: SpreadsheetNestedHeader[][];
    contextMenu?: (el, x, y, e) => SpreadsheetContextMenuItem[];
    mergeCells?: { [index: string]: number[] };
    beforeChange?: (instance?: any, cell?: any, x?: number, y?: number, value?: any) => void;
    changed?: (instance?: any, cell?: any, x?: number, y?: number, value?: any) => void;
    afterChanges?: () => void;
}

export interface SpreadsheetContextMenuItem {
    title: string;
    onclick: () => void;
}

export interface SpreadsheetNestedHeader {
    title: string;
    colspan: number;
}

export interface SpreadsheetColumn {
    type: "text" | "dropdown" | "calendar" | "image" | "checkbox" | "numeric" | "color" | "hidden";
    title: string;
    width: string;
    source?: string[];
    mask?: string;
    decimal?: string;
    readOnly?: boolean;
}

@Component
class Spreadsheet extends TsxComponent<SpreadsheetArgs> implements SpreadsheetArgs {
    @Prop() rows: any[][];
    @Prop() autoTrackData?: boolean;
    @Prop() allowToolbar?: boolean;
    @Prop() columns: SpreadsheetColumn[];
    @Prop() columnResize?: boolean;
    @Prop() rowResize?: boolean;
    @Prop() rowDrag?: boolean;
    @Prop() columnsDrag?: boolean;
    @Prop() rootCssClass?: string;
    @Prop() nestedHeaders?: SpreadsheetNestedHeader[][];
    @Prop() beforeChange?: (instance?: any, cell?: any, x?: number, y?: number, value?: any) => void;
    @Prop() changed?: (instance?: any, cell?: any, x?: number, y?: number, value?: any) => void;
    @Prop() afterChanges?: () => void;
    @Prop() contextMenu?: (el, x, y, e) => SpreadsheetContextMenuItem[];
    @Prop() mergeCells?: { [index: string]: number[] };
    private _instance: any = null;

    mounted() {
        this._instance = jspreadsheet(
            this.$el as any,
            {
                data: this.rows,
                allowToolbar: this.allowToolbar,
                columns: this.columns,
                mergeCells: this.mergeCells || {},
                columnResize: this.columnResize != false,
                rowResize: this.rowResize != false,
                rowDrag: this.rowDrag != false,
                columnsDrag: this.columnsDrag != false,
                nestedHeaders: this.nestedHeaders,
                contextMenu: this.contextMenu,
                onbeforechange: this.beforeChange,
                onchange: this.changed,
                onafterchanges: this.afterChanges,
            } as any
        );
    }

    getData(): any[][] {
        return this._instance?.getData() || [];
    }

    dataHaveChanged(): boolean {
        if (this._instance == null) {
            return false;
        }

        const currentData = this._instance.getData();
        const newData = this.rows;

        if (currentData?.length != newData?.length) {
            return true;
        }

        for (let i = 0, len = newData.length; i < len; i++) {
            const oldRow = currentData[i];
            const newRow = newData[i];

            if (oldRow?.length != newRow?.length) {
                return true;
            }

            for (let j = 0, lenJ = oldRow.length; j < lenJ; j++) {
                if ((oldRow[j] || "") != (newRow[j] || "")) {
                    const areEqual = (oldRow[j] || "") >= (newRow[j] || "") && (oldRow[j] || "") <= (newRow[j] || ""); //in case of datewrapper...hacky
                    if (!areEqual) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    updated() {
        if (this.autoTrackData != false && this.dataHaveChanged()) {
            this._instance.setData(this.rows);
        }
    }

    render(h) {
        return <div data-rowcount={this.rows?.length || 0} class={`spreadsheet-root${!isNullOrEmpty(this.rootCssClass) ? " " + this.rootCssClass : ""}`} />;
    }
}

export default toNative(Spreadsheet);
