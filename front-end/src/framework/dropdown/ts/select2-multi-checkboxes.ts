/**
 * jQuery Select2 Multi checkboxes
 * - allow to select multi values via normal dropdown control
 *
 * author      : wasikuss
 * repo        : https://github.com/wasikuss/select2-multi-checkboxes
 * inspired by : https://github.com/select2/select2/issues/411
 * License     : MIT
 */
(function ($) {
    var exclusiveBinder = function (jqElem, s2Instance) {
        var uuid = portalUtils.randomString(10);
        var ctx = jqElem.data("select2").$dropdown.find(".s2-cb-btn");

        if (!ctx.hasClass("s2-incl-excl")) {
            ctx.addClass("s2-incl-excl").prepend(
                '<div class="inv-md-checkbox s2-incl-excl-chb"><div class="inv-cbrb-inner"><input type="checkbox" id="iei-input-' +
                    uuid +
                    '"><label for="iei-input-' +
                    uuid +
                    '" class="form-check-label ">' +
                    AppState.resources.dtOnlyExclusive +
                    "</label></div></div>",
            );
            ctx.find("input").change(function (this: any) {
                s2Instance.exclusivity = $(this).prop("checked") ? 1 : 0;
                jqElem.trigger("change");
            });
        }
    };

    var S2MultiCheckboxes = function (this: any, options, element) {
        var self = this;
        self.options = options;
        self.$element = $(element);
        var values = self.$element.val();
        self.$element.removeAttr("multiple");
        self.select2 = self.$element
            .select2({
                allowClear: true,
                language: options.language,
                data: options.data,
                dropdownAutoWidth: options.dropdownAutoWidth == true,
                minimumResultsForSearch: options.minimumResultsForSearch,
                placeholder: options.placeholder,
                closeOnSelect: false,
                templateSelection: function () {
                    return self.options.templateSelection(self.$element.val() || [], $("option", self.$element).length);
                },
                templateResult: function (result) {
                    if (result.loading !== undefined) return result.text;
                    return $("<div>").text(result.text).addClass(self.options.wrapClass);
                },
                matcher: function (params, data) {
                    var original_matcher = $.fn["select2"].defaults.defaults.matcher;
                    var result = original_matcher(params, data);
                    if (result && self.options.searchMatchOptGroups && data.children && result.children && data.children.length != result.children.length) {
                        result.children = data.children;
                    }
                    return result;
                },
            })
            .data("select2");

        if (self.initialSelect2 == null) {
            self.initialSelect2 = self.select2;
        }

        self.$element.on("select2:opening", function (this: any, e) {
            if (options.allowExclusiveSearch == true) {
                let jqElem = $(this);
                let openingSelect2 = jqElem.data("select2");
                exclusiveBinder(jqElem, openingSelect2);
            }
        });

        self.select2.$results.off("mouseup").on(
            "mouseup",
            ".select2-results__option[aria-selected]",
            (function (self) {
                return function (this: any, evt) {
                    var $this = $(this);

                    var data = $this.data("data");

                    if ($this.attr("aria-selected") === "true") {
                        self.trigger("unselect", {
                            originalEvent: evt,
                            data: data,
                        });
                        return;
                    }

                    self.trigger("select", {
                        originalEvent: evt,
                        data: data,
                    });

                    evt.preventDefault();
                    evt.stopPropagation();
                    evt.stopImmediatePropagation();
                    return false;
                };
            })(self.select2),
        );

        self.select2.$dropdown.children().first().prepend('<div class="s2-cb-btn"><button class="btn btn-success btn-sm">OK</button></div>');
        if (options.allowExclusiveSearch == true) {
            exclusiveBinder(self.$element, self.select2);
        }

        self.select2.$dropdown
            .children()
            .first()
            .find("button")
            .click(function () {
                self.select2.close();
            });

        self.select2.exclusivity = 0;
        self.select2.$dropdown.addClass("s2-multi-cb");
        self.$element.attr("multiple", "multiple").val(values).trigger("change.select2");
    };

    $.fn.extend({
        select2MultiCheckboxes: function (this: any) {
            var options = $.extend(
                {
                    placeholder: "Choose elements",
                    templateSelection: function (selected, total) {
                        if (selected.length == 0 || selected.length == total) {
                            return "[" + AppState.resources.all + "]";
                        }

                        return AppState.resources.itemsOutOfArray.format(selected.length, total);
                    },
                    wrapClass: "wrap",
                    minimumResultsForSearch: -1,
                    searchMatchOptGroups: true,
                },
                arguments[0],
            );

            this.each(function (this: any) {
                new S2MultiCheckboxes(options, this);
            });
        },
    });
})(jQuery);
