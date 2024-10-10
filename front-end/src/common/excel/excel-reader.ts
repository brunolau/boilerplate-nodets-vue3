// var XLSX = require("xlsx");
import XLSX from "xlsx";

export class ExcelReader {
    static readFileAsJson(result): Array<Array<string>> {
        var inputData = result;
        if (result.srcBase64) {
            inputData = result.srcBase64;
        }

        var data = new Uint8Array(inputData);
        var workbook = XLSX.read(data, {
            cellDates: true,
            type: "array",
        });

        //So that the XLSX engine also includes first row
        var dummyHeader = [];
        for (var i = 0; i < 9999; i++) {
            dummyHeader.push(i);
        }

        //Transform data into some dummy JSON
        var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        var sheetData = XLSX.utils.sheet_to_json(firstSheet, {
            header: dummyHeader,
        });

        //Determine largest row index
        let largestIndex = 0;
        for (let i = 0, iLen = sheetData.length; i < iLen; i++) {
            let sheetRow = sheetData[i];
            for (let key in sheetRow) {
                let rowIndex = Number(key);
                if (rowIndex > largestIndex) {
                    largestIndex = rowIndex;
                }
            }
        }

        //Transform data from the engine into array of arrays and transform data into friendly objects
        let retVal = [];
        while (sheetData.length > 0) {
            let sheetRow = sheetData.shift();
            let rowArr = [];
            retVal.push(rowArr);

            for (let i = 0; i <= largestIndex; i++) {
                let rowVal = sheetRow[i];
                if (rowVal != null) {
                    if (rowVal != null && rowVal.getUTCFullYear) {
                        rowVal = new DateWrapper(rowVal.getFullYear(), rowVal.getMonth(), rowVal.getDate(), rowVal.getHours(), rowVal.getMinutes(), rowVal.getSeconds());
                    } else if (portalUtils.isString(rowVal)) {
                        rowVal = rowVal.trim();
                    }
                }

                rowArr.push(rowVal);
            }
        }

        return retVal;
    }
}
