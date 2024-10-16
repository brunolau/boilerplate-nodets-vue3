/* ===========================================================
 * trumbowyg.colors.js v1.2
 * Colors picker plugin for Trumbowyg
 * http://alex-d.github.com/Trumbowyg
 * ===========================================================
 * Author : Alexandre Demode (Alex-D)
 *          Twitter : @AlexandreDemode
 *          Website : alex-d.fr
 */

(function ($) {
    "use strict";

    $.extend(true, ($ as any).trumbowyg, {
        langs: {
            en: {
                foreColor: "Text color",
                backColor: "Background color",
                foreColorRemove: "Remove text color",
                backColorRemove: "Remove background color",
                customColor: "Custom color",
            },
        },
    });

    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }

    function colorToHex(rgb) {
        if (rgb.search("rgb") === -1) {
            return rgb.replace("#", "");
        } else if (rgb === "rgba(0, 0, 0, 0)") {
            return "transparent";
        } else {
            rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d?(.\d+)))?\)$/);
            if (rgb == null) {
                return "transparent"; // No match, return transparent as unkown color
            }
            return hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
        }
    }

    function colorTagHandler(element, trumbowyg) {
        var tags = [];

        if (!element.style) {
            return tags;
        }

        // background color
        if (element.style.backgroundColor !== "") {
            var backColor = colorToHex(element.style.backgroundColor);
            if (trumbowyg.o.plugins.colors.colorList.indexOf(backColor) >= 0) {
                tags.push("backColor" + backColor);
            } else {
                tags.push("backColorFree");
            }
        }

        // text color
        var foreColor;
        if (element.style.color !== "") {
            foreColor = colorToHex(element.style.color);
        } else if (element.hasAttribute("color")) {
            foreColor = colorToHex(element.getAttribute("color"));
        }
        if (foreColor) {
            if (trumbowyg.o.plugins.colors.colorList.indexOf(foreColor) >= 0) {
                tags.push("foreColor" + foreColor);
            } else {
                tags.push("foreColorFree");
            }
        }

        return tags;
    }

    var defaultOptions = {
        colorList: [
            "ffffff",
            "000000",
            "eeece1",
            "1f497d",
            "4f81bd",
            "c0504d",
            "9bbb59",
            "8064a2",
            "4bacc6",
            "f79646",
            "ffff00",
            "f2f2f2",
            "7f7f7f",
            "ddd9c3",
            "c6d9f0",
            "dbe5f1",
            "f2dcdb",
            "ebf1dd",
            "e5e0ec",
            "dbeef3",
            "fdeada",
            "fff2ca",
            "d8d8d8",
            "595959",
            "c4bd97",
            "8db3e2",
            "b8cce4",
            "e5b9b7",
            "d7e3bc",
            "ccc1d9",
            "b7dde8",
            "fbd5b5",
            "ffe694",
            "bfbfbf",
            "3f3f3f",
            "938953",
            "548dd4",
            "95b3d7",
            "d99694",
            "c3d69b",
            "b2a2c7",
            "b7dde8",
            "fac08f",
            "f2c314",
            "a5a5a5",
            "262626",
            "494429",
            "17365d",
            "366092",
            "953734",
            "76923c",
            "5f497a",
            "92cddc",
            "e36c09",
            "c09100",
            "7f7f7f",
            "0c0c0c",
            "1d1b10",
            "0f243e",
            "244061",
            "632423",
            "4f6128",
            "3f3151",
            "31859b",
            "974806",
            "7f6000",
        ],
        foreColorList: null, // fallbacks on colorList
        backColorList: null, // fallbacks on colorList
        allowCustomForeColor: true,
        allowCustomBackColor: true,
        displayAsList: false,
    };

    // Add all colors in two dropdowns
    $.extend(true, ($ as any).trumbowyg, {
        plugins: {
            customColor: {
                init: function (trumbowyg) {
                    trumbowyg.o.plugins.colors = trumbowyg.o.plugins.colors || defaultOptions;
                    var dropdownClass = trumbowyg.o.plugins.colors.displayAsList ? trumbowyg.o.prefix + "dropdown--color-list" : "";

                    var foreColorBtnDef = {
                            dropdown: buildDropdown("foreColor", trumbowyg),
                            dropdownClass: dropdownClass,
                        },
                        backColorBtnDef = {
                            dropdown: buildDropdown("backColor", trumbowyg),
                            dropdownClass: dropdownClass,
                        };

                    trumbowyg.addBtnDef("foreColor", foreColorBtnDef);
                    trumbowyg.addBtnDef("backColor", backColorBtnDef);
                },
                tagHandler: colorTagHandler,
            },
        },
    });

    function buildDropdown(fn, trumbowyg) {
        var dropdown = [],
            trumbowygColorOptions = trumbowyg.o.plugins.colors,
            colorList = trumbowygColorOptions[fn + "List"] || trumbowygColorOptions.colorList;

        // Remove color
        var removeColorButtonName = fn + "Remove",
            removeColorBtnDef = {
                fn: "removeFormat",
                hasIcon: false,
                param: fn,
                style: "background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAG0lEQVQIW2NkQAAfEJMRmwBYhoGBYQtMBYoAADziAp0jtJTgAAAAAElFTkSuQmCC);",
            };

        if (trumbowygColorOptions.displayAsList) {
            removeColorBtnDef.style = "";
        }

        trumbowyg.addBtnDef(removeColorButtonName, removeColorBtnDef);
        dropdown.push(removeColorButtonName);

        // Custom color
        if (trumbowygColorOptions["allowCustom" + fn.charAt(0).toUpperCase() + fn.substr(1)]) {
            // add free color btn
            var freeColorButtonName = fn + "Free",
                freeColorBtnDef = {
                    fn: function () {
                        const modal: JQuery = trumbowyg.openModalInsert(
                            trumbowyg.lang[fn],
                            {
                                color: {
                                    label: fn,
                                    forceCss: true,
                                    type: "color",
                                    value: "#FFFFFF",
                                },
                                colorHex: {
                                    label: trumbowyg.lang[fn] + " (HEX)",
                                    forceCss: true,
                                    type: "text",
                                    value: "#FFFFFF",
                                },
                            },
                            // callback
                            function (values) {
                                trumbowyg.execCmd(fn, values.color);
                                return true;
                            }
                        );

                        const $inputColor = modal.find('input[name="color"]');
                        const $inputHex = modal.find('input[name="colorHex"]');

                        $inputColor.on("change", function () {
                            const val = $inputHex.val();
                            if (val != $(this).val()) {
                                $inputHex.val($(this).val());
                            }
                        });

                        $inputHex.on("change", function () {
                            const val = $inputColor.val();
                            if (val != $(this).val()) {
                                $inputColor.val($(this).val());
                            }
                        });
                    },
                    hasIcon: false,
                    text: "# (" + trumbowyg.lang["customColor"] + ")",
                    // style adjust for displaying the text
                    style: "text-indent: 0; line-height: 20px; padding: 0 5px;",
                };

            trumbowyg.addBtnDef(freeColorButtonName, freeColorBtnDef);
            dropdown.push(freeColorButtonName);
        }

        $.each(colorList, function (i, color) {
            var btn = fn + color,
                btnDef = {
                    fn: fn,
                    forceCss: true,
                    hasIcon: false,
                    text: trumbowyg.lang["#" + color] || "#" + color,
                    param: "#" + color,
                    style: "background-color: #" + color + ";",
                };

            if (trumbowygColorOptions.displayAsList && fn === "foreColor") {
                btnDef.style = "color: #" + color + " !important;";
            }

            trumbowyg.addBtnDef(btn, btnDef);
            dropdown.push(btn);
        });

        return dropdown;
    }
})(jQuery);
