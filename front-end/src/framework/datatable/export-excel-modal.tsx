import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import Modal from "../modal/modal";
import { NamePreserver } from "../../common/name-preserver";
import ModalBody from "../modal/modal-body";
import { TableColumn } from "./datatable";
import { ExcelJsProvider } from "../../common/excel/excel-js-provider";
import NotificationProvider from "../../ui/notification";
import LoadingIndicator from "../loading-indicator";
import { IWebApiClient, WebClientApiMethod } from "../../api/IWebClient";
interface TableExportModalBindingArgs {}

interface TableExportModalArgs {
    columns: TableColumn[];
    rows: any[];
    apiClient: IWebApiClient;
    apiMethod: WebClientApiMethod;
    apiArgs?: any;
    paginationLength: number;
    totalFilteredCount: number;
}

const enum TableExportPhase {
    RecordsetSelection = 0,
    Loading = 1,
}

export interface TableExportMethods {
    show: (args: TableExportModalArgs) => void;
}

class TableExportMethodsImpl implements TableExportMethods {
    _ctx: TableExportModal;
    show(args: TableExportModalArgs): void {
        this._ctx.methodShow.call(this._ctx, args);
    }

    constructor(context: TableExportModal) {
        this._ctx = context;
    }
}

@Component
class TableExportModal extends TsxComponent<TableExportModalBindingArgs> implements TableExportModalBindingArgs, PublicMethodSet<TableExportMethods> {
    columns: TableColumn[] = null;
    phase: TableExportPhase = null;
    rows: any[] = null;
    excelJsLoaded: boolean = false;
    dataLoaded: boolean = false;
    totalFilteredCount: number = null;
    downloadedCount: number = null;
    methods: TableExportMethods = new TableExportMethodsImpl(this);

    methodShow(args: TableExportModalArgs) {
        this.columns = args.columns;
        this.rows = args.rows;
        this.phase = TableExportPhase.RecordsetSelection;
        this.excelJsLoaded = ExcelJsProvider.excelJsInstance() != null;
        this.dataLoaded = (this.rows || []).length >= args.totalFilteredCount;
        this.totalFilteredCount = args.totalFilteredCount;
        (this.$refs.tableExportDialog as typeof Modal.prototype).show();

        if (!this.excelJsLoaded) {
            ExcelJsProvider.getExcelJs()
                .then((excelJs) => {
                    this.excelJsLoaded = true;
                    this.exportExcel();
                })
                .catch((err) => {
                    NotificationProvider.showErrorMessage(err);
                    this.hideExportModal();
                });
        }

        if (!this.dataLoaded) {
            this.rows = [];
            this.downloadedCount = 0;
            this.downloadDataChunk(args.apiClient, args.apiMethod, args.apiArgs, 0);
            this.exportExcel();
        }

        this.exportExcel();
    }

    downloadDataChunk(apiClient: IWebApiClient, apiMethod: WebClientApiMethod, ajaxArgs: any, steps: number): void {
        const STEP_COUNT = 1000;
        ajaxArgs.PaginationPosition = steps + 1;
        ajaxArgs.PaginationLength = STEP_COUNT;

        var mySelf = this;
        apiClient[apiMethod](ajaxArgs)
            .then((data: any) => {
                data.Rows.forEach(function (row) {
                    mySelf.rows.push(row);
                });

                mySelf.downloadedCount += data.Rows.length;
                if (data.Rows.length < STEP_COUNT) {
                    mySelf.totalFilteredCount = mySelf.downloadedCount;
                    mySelf.dataLoaded = true;
                    mySelf.exportExcel();
                } else {
                    mySelf.downloadDataChunk(apiClient, apiMethod, ajaxArgs, steps + 1);
                }
            })
            .catch((err) => {
                NotificationProvider.showErrorMessage(AppState.resources.errorFetchingData);
                this.hideExportModal();
            });
    }

    hideExportModal() {
        (this.$refs.tableExportDialog as typeof Modal.prototype).hide();
    }

    exportExcel() {
        if (this.dataLoaded && this.excelJsLoaded) {
            var colArr = [];
            this.columns.forEach((item) => {
                if (item.exportInclude != false) {
                    colArr.push({
                        header: item.caption,
                        width: 25,
                    });
                }
            });

            var workbook = new (ExcelJsProvider.excelJsInstance().Workbook)();
            workbook.created = new Date();
            workbook.modified = new Date();
            workbook.lastPrinted = new Date();

            var worksheet = workbook.addWorksheet("Export");
            worksheet.columns = colArr;
            worksheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

            var firstRow = worksheet.getRow(1);
            firstRow.font = {
                name: "Arial",
                family: 4,
                size: 10,
                bold: true,
                color: { argb: "00000000" },
                bgColor: { argb: "80EF1C1C" },
            };
            firstRow.alignment = { vertical: "middle", horizontal: "center" };
            firstRow.height = 20;
            firstRow._cells.forEach((cell) => {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "cccccc" },
                };
            });

            this.rows.forEach((row) => {
                var rowExportData = [];

                this.columns.forEach((col) => {
                    if (col.exportInclude != false) {
                        if (col.exportValue != null) {
                            rowExportData.push(col.exportValue(row));
                        } else {
                            rowExportData.push(row[col.id]);
                        }
                    }
                });

                worksheet.addRow(rowExportData);
            });

            var mySelf = this;
            workbook.xlsx
                .writeBuffer()
                .then((data: Uint8Array) => {
                    var blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                    portalUtils.downloadBlob(blob, "export.xlsx", () => {
                        setTimeout(() => {
                            mySelf.hideExportModal();
                        }, 300);
                    });
                })
                .catch((err) => {
                    let omg = err;
                    if (omg == "wtf") {
                        alert("wtf..");
                    }
                });
        }
    }

    getCompletePercent() {
        return Math.round((this.downloadedCount / this.totalFilteredCount) * 100) + " %";
    }

    render(h) {
        return (
            <Modal ref="tableExportDialog" title={"Export"}>
                <ModalBody>
                    <div style="min-height:200px;position:relative;">
                        <LoadingIndicator visible={true} />
                    </div>
                    <h4 style="text-align:center;">{this.getCompletePercent()}</h4>
                </ModalBody>
            </Modal>
        );
    }
}

export default toNative(TableExportModal);
