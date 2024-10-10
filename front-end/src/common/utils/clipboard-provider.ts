/**
 * Cross-browser clipboard handler
 */
export default class ClipboardProvider {
    /**
     * Copy given text to the clipboard
     *
     * @param text Text for clipboard copy
     */
    static copyToClipboard(text: string): boolean {
        let container = document.createElement("div");
        document.body.appendChild(container);

        let dummyElem = document.createElement("textarea");
        dummyElem.id = "txt-" + portalUtils.randomString(8);
        dummyElem.style.fontSize = "12pt";
        dummyElem.style.border = "0";
        dummyElem.style.padding = "0";
        dummyElem.style.margin = "0";
        dummyElem.style.position = "absolute";
        dummyElem.style["left"] = "0";
        dummyElem.setAttribute("readonly", "");
        dummyElem.style.opacity = "0.001";

        let yPosition = window.pageYOffset || document.documentElement.scrollTop;
        dummyElem.style.top = `${yPosition}px`;
        dummyElem.value = text;

        let fakeHandler: any;
        let fakeHandlerCallback: any;
        let cleanUp = () => {
            container.removeEventListener("click", fakeHandlerCallback);
            fakeHandler = null;
            fakeHandlerCallback = null;
            document.body.removeChild(container);
            cleanUp = null;
        };

        fakeHandlerCallback = () => {
            cleanUp();
        };
        fakeHandler = container.addEventListener("click", fakeHandlerCallback);

        container.appendChild(dummyElem);
        dummyElem.focus();
        dummyElem.select();
        dummyElem.setSelectionRange(0, dummyElem.value.length);

        let succeeded = false;
        try {
            succeeded = document.execCommand("copy");
        } catch (err) {
            succeeded = false;
            cleanUp();
        }

        return succeeded;
    }

    /**
     * Copy given object array into format that can get consumed by excel
     *
     * @param rowArr Array of rows
     */
    static copySheetToClipboard(rowArr: any[]): boolean {
        return this.copyToClipboard(this._stringifyObjForSheetExport(rowArr));
    }

    /**
     * PRIVATE Powered by sheetclip
     *
     * @param arr
     */
    private static _stringifyObjForSheetExport(arr: any[]) {
        var r,
            rlen,
            c,
            clen,
            str = "",
            val;
        for (r = 0, rlen = arr.length; r < rlen; r += 1) {
            for (c = 0, clen = arr[r].length; c < clen; c += 1) {
                if (c > 0) {
                    str += "\t";
                }
                val = arr[r][c];
                if (typeof val === "string") {
                    if (val.indexOf("\n") > -1) {
                        str += '"' + val.replace(/"/g, '""') + '"';
                    } else {
                        str += val;
                    }
                } else if (val === null || val === void 0) {
                    //void 0 resolves to undefined
                    str += "";
                } else {
                    str += val;
                }
            }
            str += "\n";
        }
        return str;
    }
}
