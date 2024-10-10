export interface ExcelExportDataSource {
    sheets: ExcelExportSheet[];
    outputFileName: string;
}

export interface ExcelExportSheet {
    headers: ExcelExportHeader[];
    rows: string[][];
    sheetName: string;
}

export interface ExcelExportHeader {
    caption: string;
    width?: number;
}

export class ExcelJsProvider {
    static getExcelJs(): Promise<any> {
        if (ExcelJsProvider.excelJsInstance() != null) {
            return new Promise(function (resolve, reject) {
                resolve(ExcelJsProvider["_excelJs"]);
            });
        }

        return new Promise(function (resolve, reject) {
            import("exceljs/dist/exceljs.js")
                .then((excelWrapper) => {
                    ExcelJsProvider["_excelJs"] = excelWrapper;
                    resolve(excelWrapper);
                })
                .catch((reason) => {
                    reject(reason);
                });
        });
    }

    static exportToExcel(args: ExcelExportDataSource): Promise<any> {
        return new Promise((resolve, reject) => {
            ExcelJsProvider.getExcelJs()
                .then(() => {
                    var colArr = [];
                    var workbook = new (ExcelJsProvider.excelJsInstance().Workbook)();
                    workbook.created = new Date();
                    workbook.modified = new Date();
                    workbook.lastPrinted = new Date();

                    args.sheets.forEach((sheet) => {
                        sheet.headers.forEach((item) => {
                            colArr.push({
                                header: item.caption,
                                width: item.width != null ? item.width : 25,
                            });
                        });

                        var worksheet = workbook.addWorksheet(sheet.sheetName);
                        worksheet.columns = colArr;
                        colArr = [];
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

                        sheet.rows.forEach((rowArr) => {
                            var rowExportData = [];
                            rowArr.forEach((rowItem) => {
                                rowExportData.push(rowItem);
                            });

                            worksheet.addRow(rowExportData);
                        });
                    });

                    var mySelf = this;
                    workbook.xlsx
                        .writeBuffer()
                        .then((data: Uint8Array) => {
                            var blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                            portalUtils.downloadBlob(blob, args.outputFileName, () => {
                                resolve(null);
                            });
                        })
                        .catch((err) => {
                            reject(err);
                        });
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    static excelJsInstance(): any {
        return ExcelJsProvider["_excelJs"];
    }
}
