import ListviewBuilder from "./legacy_lvb";
import "./legacy_fdd.css";
let $ = jQuery;

export interface FilterableSelectArgs {
    elem: JQuery | string;
    data: FilterableSelectDataSource[];
    onItemSelected: (data: any[], exclusivity: number) => void;
    allowExclusiveSearch?: boolean;
    exclusiveInclusive?: any;
    autoInputFocus?: boolean;
    cancelText: string;
    confirmText?: string;
    filterText: string;
    selectedIds?: string[];
    multiselect?: boolean;
    pagingCount?: number;
    cancelCss?: string;
    confirmCss?: string;
    clickEventName?: string;
    animate?: boolean;
    iScroll?: boolean;
    iframeTopMode?: boolean;
    formatResult?: (state: any) => JQuery | string;
    formatSelection?: (state: any) => JQuery | string;
}

export interface FilterableSelectDataSource {
    id: string;
    text: string;
}

export default function FilterableSelect(this: any, args: FilterableSelectArgs): void {
    var self = this;
    var iframeTopMode = !(args.iframeTopMode == false);
    var contextWindow, contextBody;

    if (iframeTopMode) {
        contextWindow = window.top;
        contextBody = contextWindow.document.body;
    } else {
        contextWindow = window;
        contextBody = window.document.body;
    }

    args = args || ({} as any);
    var elem = args.elem;
    var data = args.data;
    var cancelText = args.cancelText;
    var filterText = args.filterText;
    var selectedIds = args.selectedIds;
    var pagingCount = args.pagingCount || 35;
    var cancelButtonCss = args.cancelCss || "";
    var confirmText = args.confirmText || "OK";
    var confirmButtonCss = args.confirmCss || "";
    var clickEventName = args.clickEventName || "click";
    var hasOptionGroups = data[0] != null && (data[0] as any).isOptionGroup == true;
    var animate = args.animate;
    var useIscroll = args.iScroll;
    var useFastClick = false;
    var autoInputFocus = args.autoInputFocus != false;
    var innerHeight = $(contextWindow).height() - 167;
    var openClickTime = null;
    self.onItemSelected = args.onItemSelected;
    self.onCancel = null;
    self.animate = animate;
    self.selectedIds = selectedIds;
    self.multiselect = args.multiselect == true;
    FilterableSelect["currentInstance"] = self;

    function htmlEscape(str) {
        return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    self._isGhostClick = function () {
        if (!useIscroll && !useFastClick) {
            return false;
        }

        var timeNow = new Date().getTime();
        var timeDiff = timeNow - openClickTime;
        return !(timeDiff > 700);
    };

    self._getDropDownInnerStyle = function () {
        if (useIscroll) {
            return "";
        } else {
            return "overflow-y: scroll !important;";
        }
    };

    self._getDropDownTemplate = function () {
        var bottomCss = "";
        var rootCss = args.multiselect ? "fdd-multiselect-root" : "fdd-singleselect-root";
        var buttonHtml = '<button id="btn_fdd_FddCancel" type="button" class="fdd-cancel-btn ' + cancelButtonCss + '">' + cancelText + "</button>";

        if (self.multiselect) {
            bottomCss = "fdd-bottom-hasmultiple";
            buttonHtml += '<div class="fdd-btn-separator"></div><button id="btn_fdd_FddConfirm" type="button" class="fdd-confirm-btn ' + confirmButtonCss + '">' + confirmText + "</button>";
        }

        return (
            '<div id="filterableSelectDropDown" style="" class="' +
            self._getAnimClass() +
            self._getAllowExclusivityCss() +
            " " +
            rootCss +
            '"><div id="filterableSelectDropDownInner" class="fdd-list-block fdd-winner fdd-main" style="' +
            self._getDropDownInnerStyle() +
            '"><div id="filterableSelectDropWrap" class="fdd-swrap"><div id="filterableSelectDropContainer" class="fdd-sscroll"></div></div></div><div class="fdd-bottom ' +
            bottomCss +
            '">' +
            buttonHtml +
            "</div></div>"
        );
    };

    self._getAnimClass = function () {
        var animateClass = "";
        if (self.animate) {
            return "fdd-anim-init";
        } else {
            return "";
        }
    };

    self._getAllowExclusivityCss = function () {
        return args.allowExclusiveSearch == true ? " fdd-has-exclusive-switch " : "";
    };

    self._getTargetElement = function (iScroll) {
        if (iScroll) {
            return $(contextBody).find("#filterableSelectDropContainer");
        } else {
            return $(contextBody).find("#filterableSelectDropDownInner");
        }
    };

    self._getClickEventName = function (iScroll) {
        if (iScroll) {
            return "iscrollTap";
        } else {
            return "click";
        }
    };

    self.removeElems = function (preventGhostClick) {
        if (preventGhostClick == null) {
            preventGhostClick = false;
        }

        if (preventGhostClick) {
            var newElem = '<div id="ghostClickHack" style="position:fixed;height:100%;width:100%;z-index:999990"></div>';
            $(contextBody).prepend(newElem);
        }

        if (useIscroll) {
            if (contextWindow["_filterableIscroll"] != null) {
                try {
                    contextWindow["_filterableIscroll"].destroy();
                } catch (e) {}

                contextWindow["_filterableIscroll"] = null;
            }
        }

        contextWindow.isFilterableDropDownOpen = false;
        $(contextBody).find("#filterableSelectOverlay").remove();
        $(contextBody).find("#filterableSelectDropDown").remove();
        $(contextBody).find(".filterableSelectFilter").remove();

        if (preventGhostClick) {
            setTimeout(function () {
                if (contextWindow["PreventKeyboardHack"] == true) {
                    contextWindow["PreventKeyboardHack"] = null;
                }

                $(contextBody).find("#ghostClickHack").remove();
            }, 500);
        }
    };

    self.cancel = function () {
        if (self.onCancel != null) {
            self.onCancel();
        }

        self.close();
    };

    self.close = function () {
        self.removeElems();
    };

    self._getRowLineWithSelected = function (item) {
        var itemLine;
        if (self.selectedIds == null || self.selectedIds.indexOf(item.id) == -1) {
            itemLine =
                '<li class="accordion-item filterabledd-item fdd-noselected" data-id="{id}"><a href="javascript:" class="fdd-item-link fdd-item-content"><div class="fdd-item-inner fdd-inner"><div class="fdd-item-title fdd-item">{text}</div></div></a></li>';
        } else {
            itemLine =
                '<li class="accordion-item filterabledd-item fdd-selected" data-id="{id}"><a href="javascript:" class="fdd-item-link fdd-item-content"><div class="fdd-item-inner fdd-inner"><div class="fdd-item-title fdd-item">{text}</div></div></a></li>';
        }

        for (var prop in item) {
            itemLine = itemLine.replace(new RegExp("{" + prop + "}", "g"), htmlEscape(item[prop]));
        }

        if (hasOptionGroups) {
            if ((item as any).isOptionGroup == true) {
                itemLine = itemLine.replace("filterabledd-item", "filterabledd-item filterabledd-optgroup");
            } else {
                itemLine = itemLine.replace("filterabledd-item", "filterabledd-item filterabledd-optgroup-item");
            }
        }

        return itemLine;
    };

    self.hide = function () {
        $(document).trigger("fdd-hide", $("#filterableSelectDropDown"));

        if (self.animate) {
            $(contextBody).find("#filterableSelectOverlay").removeClass("fdd-anim-shown");
            $(contextBody).find("#filterableSelectDropDown").removeClass("fdd-anim-shown");
            setTimeout(function () {
                self.removeElems(true);
            }, 350);
        } else {
            self.removeElems(true);
        }
    };

    self.open = function () {
        self.removeElems();
        contextWindow.isFilterableDropDownOpen = true;
        $(contextBody).append(self.overlayTemplate);
        $(contextBody).append(self.dropDownTemplate);
        if (contextWindow["PreventKeyboardHack"] == null) {
            contextWindow["PreventKeyboardHack"] = true;
        }

        var builder = new ListviewBuilder();
        builder.data = self.data;
        builder.parentTemplate = "<ul>{content}</ul>";
        builder.itemTemplate =
            '<li class="accordion-item filterabledd-item" data-id="{id}"><a href="javascript:" class="fdd-item-link fdd-item-content"><div class="fdd-item-inner fdd-inner"><div class="fdd-item-title fdd-item">{text}</div></div></a></li>';
        builder.targetElem = self._getTargetElement(useIscroll);
        builder.pagingCount = pagingCount;
        builder.filter = true;
        builder.filterField = "filterValue";
        builder.useFastClick = false;
        builder.showPagination = builder.data.length >= builder.pagingCount;
        builder.clickEventName = clickEventName;
        builder.itemClicked = function () {
            if (!self._isGhostClick()) {
                var sender = $(this);
                var liSender = sender.is("li") ? sender : sender.closest("li");
                var exlusivity = $(".fdd-incl-excl-chb input").prop("checked") == true ? 1 : 0;
                openClickTime = new Date().getTime();

                if (liSender.hasClass("filterabledd-optgroup")) {
                    return;
                }

                if (self.elem != null) {
                    var selVal = sender.text();
                    self.elem.val(selVal);
                    self.elem.find(".dropdownSelectedItem").html(selVal);
                }

                var cbi = self.getDataFromElement(liSender);
                if (cbi == null) {
                    cbi = {
                        id: self.getIdFromElement(liSender),
                        text: sender.text(),
                    };
                }

                if (!self.multiselect) {
                    self.hide();
                    if (self.onItemSelected != null) {
                        self.onItemSelected([cbi], exlusivity);
                    }
                } else {
                    if (liSender.hasClass("fdd-selected")) {
                        liSender.removeClass("fdd-selected").addClass("fdd-noselected");
                    } else {
                        liSender.removeClass("fdd-noselected").addClass("fdd-selected");
                    }
                }
            }
        };

        builder.onRowsBuilt = function (elem, dataArr) {
            if (args.formatSelection != null) {
                dataArr.forEach(function (dataItem) {
                    if (dataItem != null) {
                        var targetElem = elem.find('[data-id="' + dataItem.id + '"] .fdd-item');
                        targetElem.html("");

                        var formatedResult = args.formatSelection(dataItem);
                        if (formatedResult["jquery"]) {
                            targetElem.append(formatedResult);
                        } else {
                            targetElem.html(formatedResult);
                        }
                    }
                });
            }
        };

        builder._getRowLine = self._getRowLineWithSelected;
        builder.build();

        var currentContext = self._getTargetElement(useIscroll);
        var currentFilter = currentContext.find(".lvb-filter-container").first();
        currentFilter.css({
            position: "fixed",
            "margin-left": "3%",
            width: "94%",
            "z-index": "999997",
            top: "12px",
            height: "48px",
            left: "0",
            "margin-top": "0",
        });
        currentFilter.appendTo($(contextBody).find("#filterableSelectDropDown"));
        currentFilter.addClass("filterableSelectFilter");
        currentFilter.find("input").attr("placeholder", filterText);

        if (args.allowExclusiveSearch == true) {
            $(
                '<div class="inv-md-checkbox fdd-incl-excl-chb"><div class="inv-cbrb-inner"><input type="checkbox" id="iei-input-RCFCQ13X20"><label for="iei-input-RCFCQ13X20" class="form-check-label ">Only items fulfilling all criteria</label></div></div>'
            ).appendTo(".filterableSelectFilter");

            if (args.exclusiveInclusive == 1) {
                $(".fdd-incl-excl-chb input").prop("checked", true);
            }
        }

        if (self.animate) {
            setTimeout(function () {
                $(contextBody).find("#filterableSelectOverlay").addClass("fdd-anim-shown");
                $(contextBody).find("#filterableSelectDropDown").addClass("fdd-anim-shown");
            }, 50);
        }

        if (self.selectedIds != null && self.selectedIds.length > 0) {
            var availableHeight = $(window).height() - 100;
            var selectedTop = $(".fdd-selected").offset().top;

            if (selectedTop > availableHeight) {
                $("#filterableSelectDropDownInner")[0].scrollTop = selectedTop - availableHeight - 160;
            }
        }

        currentContext.find(".paginator-container").attr("style", "margin-top:20px;margin-bottom:10px;");
        openClickTime = new Date().getTime();

        if (useIscroll) {
            contextWindow["_filterableIscroll"] = window["utils"].bindIscroll($(contextBody).find("#filterableSelectDropWrap"));
            currentContext.find(".paginator-container").attr("style", "margin-top:10px;margin-bottom:10px;");
        }

        $(contextBody)
            .find("#btn_fdd_FddCancel")
            .click(function () {
                self.close();
            });

        if (self.multiselect) {
            $(contextBody)
                .find("#btn_fdd_FddConfirm")
                .click(function () {
                    self.onOkButtonClicked();
                });
        }

        if (autoInputFocus) {
            setTimeout(function () {
                $(contextBody).find("input").blur();
            }, 20);
        }

        $(document).trigger("fdd-show", $("#filterableSelectDropDown"));
    };

    self.onOkButtonClicked = function () {
        var retArr = [];
        var selArr = $(contextBody).find(".fdd-selected");
        var exlusivity = $(".fdd-incl-excl-chb input").prop("checked") == true ? 1 : 0;

        selArr.each(function () {
            var item = self.getDataFromElement($(this));
            if (item != null) {
                retArr.push(item);
            }
        });

        self.hide();
        if (self.onItemSelected != null) {
            self.onItemSelected(retArr, exlusivity);
        }
    };

    self.getIdFromElement = function (liElem) {
        return liElem.attr("data-id");
    };

    self.getDataFromElement = function (liElem) {
        var selId = self.getIdFromElement(liElem);
        for (var i = 0, len = self.data.length; i < len; i++) {
            if (self.data[i].id == selId) {
                return self.data[i];
            }
        }

        return null;
    };

    if (data != null) {
        $.each(data, function (i, dataItem) {
            dataItem["filterValue"] = dataItem.text.latinize();
        });

        self.data = data; //fadeInFddOverlay fdd-ovl-animated
        self.overlayTemplate =
            '<div class="' +
            self._getAnimClass() +
            '" id="filterableSelectOverlay" style="position:fixed;top:0;height:120%; width:120%;z-index:999990;background-color:black;opacity:0.7;margin-left:-5px;"></div>';
        self.dropDownTemplate = self._getDropDownTemplate(useIscroll);
        self.buttonTemplate =
            '<div class="ui-select"><div data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-icon="arrow-d" data-iconpos="right" data-theme="c" class="ui-btn ui-shadow ui-btn-corner-all ui-btn-icon-right ui-btn-up-c"><span class="ui-btn-inner"><span class="ui-btn-text"><span class="dropdownSelectedItem"></span></span><span class="ui-icon ui-icon-arrow-d ui-icon-shadow">&nbsp;</span></span></div></div>';
    }

    if (elem != null && data != null) {
        if (typeof elem == "string" || elem instanceof String) {
            elem = $(contextBody).find("#" + elem);
        }

        self.elem = elem;
        self.elem.val("");
        elem.html(self.buttonTemplate);

        self.elem.find(".ui-select").fastClick(function () {
            if (!self._isGhostClick()) {
                self.open();
            }
        });

        self.val = function (newValue) {
            if (newValue == null || newValue.toString().length == 0) {
                return self.elem.val();
            }
        };
    }

    return self;
}
