let $ = jQuery;

export default function ListviewBuilder(this: any): void {
    var self = this;
    self.parentTemplate = null;
    self.itemTemplate = null;
    self.targetElem = null;
    self.data = null;
    self.pagingCount = null;
    self.filter = null;
    self.filterField = null;
    self.filterTimeOutValue = 400;
    self.showPagination = true;
    self.clickEventName = "click";
    self.useFastClick = false;
    self.itemClicked = null;
    self.pageText = "Page";
    self._filterResults = null;

    self.build = function () {
        self._filterVal = "";
        self.internal.getTemplates();
        self.internal.buildFilter();
        self.internal.buildRowLines();
        self.internal.buildRows();
        self.internal.buildPagination();
    };

    self._getRowLine = function (item) {
        var itemLine = self.itemTemplate;
        for (var prop in item) {
            itemLine = itemLine.replace(new RegExp("{" + prop + "}", "g"), item[prop]);
        }
        return itemLine;
    };

    self.appendRowLine = function (item, isSorted) {
        var newIndex = self.data.length;
        var itemLine = self._getRowLine(item);
        self.data.push(item);
        self._itemRows[newIndex] = itemLine;
        self.internal.buildRows();
    };

    self.refreshRowLine = function (item, index) {
        var itemLine = self._getRowLine(item);
        self._itemRows[index] = itemLine;
    };

    self.filterFunc = function (filterValue, pageLimit, builder) {
        var data = self.data;
        var field = self.filterField;
        var key = filterValue.toLowerCase();
        var foundItems = 0;
        var rowArr = [];

        for (var i = 0; i < data.length; i++) {
            var currentRow = data[i];
            var fieldVal = currentRow[field];

            if (fieldVal != null && fieldVal.toLowerCase().indexOf(key) != -1) {
                rowArr.push(currentRow);
                builder.append(self._itemRows[i]);
                foundItems++;
            }

            if (foundItems >= pageLimit) {
                break;
            }
        }

        return rowArr;
    };

    this.internals = function () {
        this.getTemplates = function () {
            self._prodSearchTemplate = '<div class="lvb-filter-erase"><span class="far fa-trash-alt"></span></div><input type="text" class="lvb-filter-input">';

            var displayPagination;
            if (!self.showPagination) {
                displayPagination = 'style="display:none;"';
            }

            var filterPart = "";
            if (self.filter) {
                filterPart = '<div class="lvb-filter-container"></div>';
            }

            self.targetElem.html(filterPart + '<div class="items-container"></div><div class="paginator-container" ' + displayPagination + "></div>");
        };

        this.buildFilter = function () {
            if (self.filter) {
                var filterContext = $(".lvb-filter-container", self.targetElem).first();
                filterContext.html(self._prodSearchTemplate);
                self._searchInput = $("input", filterContext).first();

                self._searchInput.keydown(function (e) {
                    if (e.keyCode == 13) {
                        e.preventDefault();
                        return false;
                    }
                });

                var currentTimeOut = null;

                self._searchInput.bind("keyup change input", function () {
                    if (currentTimeOut != null) {
                        clearTimeout(currentTimeOut);
                    }

                    currentTimeOut = setTimeout(function () {
                        currentTimeOut = null;
                        self._pageIndex = 0;
                        var currVal = self._searchInput.val();
                        if (currVal != self._filterVal) {
                            self._filterVal = currVal;
                            self.internal.buildRows();
                        }
                    }, self.filterTimeOutValue);
                });

                $(".filter-erase", filterContext)
                    .first()
                    .click(() => {
                        if (currentTimeOut != null) {
                            clearTimeout(currentTimeOut);
                        }

                        if (self._filterVal != "") {
                            self._filterVal = "";
                            self._searchInput.val("");
                            self.internal.buildRows();
                        }
                    });
            }
        };

        this.buildRowLines = function () {
            self._itemRows = new Object();
            if (self.data != null && self.data.length > 0) {
                for (var i = 0; i < self.data.length; i++) {
                    var item = self.data[i];
                    self.refreshRowLine(item, i);
                }
            }
        };

        function replaceHtml(el, html) {
            var oldEl = typeof el === "string" ? document.getElementById(el) : el;
            /*@cc_on // Pure innerHTML is slightly faster in IE
                oldEl.innerHTML = html;
                return oldEl;
            @*/
            var newEl = oldEl.cloneNode(false);
            newEl.innerHTML = html;
            oldEl.parentNode.replaceChild(newEl, oldEl);
            /* Since we just removed the old element from the DOM, return a reference
            to the new element, which can be used to restore variable references. */
            return newEl;
        }

        this.buildRows = function () {
            var rows = self._itemRows;
            var pageLimit = this.getPageLimit();
            var startIndex = 0;
            var endIndex = rows.length;
            var builder = new this.stringBuilder();
            var dataArr;

            if (self._filterVal.length == 0) {
                self._filterResults = endIndex;
                dataArr = [];

                if (self.pagingCount != null) {
                    if (self._pageIndex != null) {
                        startIndex = self._pageIndex * self.pagingCount;
                    }
                    pageLimit = self.pagingCount;
                    endIndex = pageLimit + startIndex;
                }

                var dataCount = Object.keys(self.data).length;
                if (dataCount < endIndex) {
                    endIndex = dataCount;
                }

                for (var i = startIndex; i < endIndex; i++) {
                    try {
                        var dataItem = self.data[i];
                        if (dataItem != null) {
                            dataArr.push(self.data[i]);
                        }

                        builder.append(rows[i]);
                    } catch (err) {}
                }

                $(".paginator-container", self.targetElem).show();
            } else {
                dataArr = self.filterFunc(self._filterVal, pageLimit, builder);
                $(".paginator-container", self.targetElem).show();
            }

            var listItems = builder.toString();
            var newHtml = self.parentTemplate.replace("{content}", listItems);
            this.replaceInnerHTML($(".items-container", self.targetElem)[0], newHtml);
            this.bindClickHandler();
            this.buildPagination();
            self.targetElem.trigger("listview-rows-built");

            if (self.onRowsBuilt != null) {
                self.onRowsBuilt(self.targetElem, dataArr);
            }
        };

        this.replaceInnerHTML = function (oldDiv, html) {
            var newDiv = oldDiv.cloneNode(false);
            newDiv.innerHTML = html;
            oldDiv.parentNode.replaceChild(newDiv, oldDiv);
        };

        this.bindClickHandler = function () {
            if (self.itemClicked != null) {
                $("li", $(".items-container", self.targetElem)).bind(self.clickEventName, self.itemClicked);
            }
        };

        this.buildPagination = function () {
            if (self.showPagination) {
                var pageIndex = this.getCurrentIndex();
                var totalPages = this.getTotalPages();
                var buttons = '<div style="text-align:center;">';
                buttons += '<select class="pagination-select">';

                for (var i = 0; i < totalPages; i++) {
                    var selected = "";
                    if (i == pageIndex) {
                        selected = " selected ";
                    }

                    buttons += '<option value="' + i + '"' + selected + ">" + self.pageText + " " + (i + 1) + " / " + totalPages + "</option>";
                }

                buttons += "</select>";
                buttons += "</div>";

                var currentContext = this;
                $(".paginator-container", self.targetElem).html(buttons);
                $(".pagination-select", self._paginatorContainer).change(function () {
                    var newValue = Number($(this).val());
                    currentContext.onPaginationButtonClicked(newValue);
                });
            } else {
                $(".paginator-container", self.targetElem).hide();
            }
        };

        this.onPaginationButtonClicked = function (newIndex) {
            self.targetElem.trigger("pagination-start", null);
            var currentContext = this;
            setTimeout(function () {
                currentContext.changePagination(newIndex);
                currentContext.buildRows();
                window.scrollTo(0, 0);
                self.targetElem.trigger("pagination-end", null);
            }, 200);
        };

        this.changePagination = function (newIndex) {
            if (self._pageIndex == null) {
                self._pageIndex = 0;
            }

            self._pageIndex = newIndex;
            if (self._pageIndex < 0) {
                self._pageIndex = 0;
            } else if (self._pageIndex > this.getTotalPages() - 1) {
                self._pageIndex = this.getTotalPages() - 1;
            }

            $(".current-pg-page", self._paginatorContainer).text(self._pageIndex + 1);
        };

        this.getPageLimit = function () {
            if (self.pagingCount != null) {
                return self.pagingCount;
            } else {
                return 99999999999999;
            }
        };

        this.getCurrentIndex = function () {
            if (self._pageIndex != null) {
                return self._pageIndex;
            } else {
                return 0;
            }
        };

        this.getTotalPages = function () {
            var pageLimit = this.getPageLimit();
            if (self._filterResults != null) {
                return Math.ceil(self._filterResults / pageLimit);
            } else {
                return Math.ceil(self.data.length / pageLimit);
            }
        };

        this.getFilledParent = function (content) {
            return self.parentTemplate.replace(/{content}/g, content);
        };

        this.stringBuilder = function () {
            var strings = [];

            this.append = function (string) {
                string = verify(string);
                if (string.length > 0) strings[strings.length] = string;
            };

            this.appendLine = function (string) {
                string = verify(string);
                if (this.isEmpty()) {
                    if (string.length > 0) strings[strings.length] = string;
                    else return;
                } else strings[strings.length] = string.length > 0 ? "\r\n" + string : "\r\n";
            };

            this.clear = function () {
                strings = [];
            };

            this.isEmpty = function () {
                return strings.length == 0;
            };

            this.toString = function () {
                return strings.join("");
            };

            var verify = function (string) {
                if (!defined(string)) return "";
                if (getType(string) != getType(new String())) return String(string);
                return string;
            };

            var defined = function (el) {
                // Changed per Ryan O'Hara's comment:
                return el != null && typeof el != "undefined";
            };

            var getType = function (instance) {
                if (!defined(instance.constructor)) throw Error("Unexpected object type");
                var type = String(instance.constructor).match(/function\s+(\w+)/);

                return defined(type) ? type[1] : "undefined";
            };
        };
    };

    self.internal = new self.internals();
}
