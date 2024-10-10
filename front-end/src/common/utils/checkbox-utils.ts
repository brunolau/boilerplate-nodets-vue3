export default class CheckboxUtils {
    private static shiftClickBound: boolean = false;

    static bindTableShiftClick() {
        if (!CheckboxUtils.shiftClickBound) {
            CheckboxUtils.shiftClickBound = true;

            $(document).on("click", ".dt-selection-checkbox .inv-chckb-clickable", function (this: any, e) {
                if (e.shiftKey) {
                    var rootSelector = ".dt-item";
                    var $this = $(this);
                    const INPUT_SELECTOR = '.dt-selection-checkbox input[type="checkbox"]';

                    if ($this.closest(rootSelector).length == 0) {
                        rootSelector = ".dt-mobile-row";
                    }

                    var checkbox = $this.parent().find("input");
                    var willBeChecked = !checkbox.prop("checked");
                    var rangeState = !willBeChecked;
                    var currRow = $this.closest(rootSelector);
                    var chbRange: JQuery[] = [checkbox];
                    var shouldMoveUp = willBeChecked;

                    while (true) {
                        if (shouldMoveUp) {
                            currRow = currRow.prev();
                        } else {
                            currRow = currRow.next();
                        }

                        if (currRow.length == 0) {
                            break;
                        }

                        var rowInput = currRow.find(INPUT_SELECTOR);
                        if (rowInput.prop("checked") == rangeState) {
                            chbRange.push(rowInput);
                        } else {
                            break;
                        }
                    }

                    chbRange.forEach((chbItem) => {
                        chbItem.prop("checked", willBeChecked);
                    });

                    e.preventDefault();
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    return false;
                }
            });
        }
    }
}
