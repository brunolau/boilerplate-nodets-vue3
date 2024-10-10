import { toNative, Prop, Watch } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import FormItemWrapper, { FormItemWrapperArgs, MarginType } from "../form/form-item-wrapper";
import "trumbowyg";
import "./plugins/trumbowyg/lang/cs.ts";
import "./plugins/trumbowyg/lang/de.ts";
import "./plugins/trumbowyg/lang/sk.ts";
import "./plugins/trumbowyg/custom-cleanpaste";
import "./plugins/trumbowyg/custom-colors";
import "./plugins/trumbowyg/open-modal-fix";
import "trumbowyg/plugins/emoji/trumbowyg.emoji.js";
import "trumbowyg/plugins/noembed/trumbowyg.noembed.js";
import "trumbowyg/plugins/fontsize/trumbowyg.fontsize.js";
import "trumbowyg/dist/ui/trumbowyg.min.css";
import "trumbowyg/dist/plugins/emoji/ui/trumbowyg.emoji.css";
import "../input/css/wysiwig.css";

import { FileManagerDialog, FileManagerModalFileType } from "../modal/ts/file-manager-dialog";
import { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";
import EsModuleImportHelper from "../../common/utils/esmodule-import-helper";

const svgIcons = "/assets/img/trumbowyg-icons.svg";

interface WysiwigEditorArgs extends FormItemWrapperArgs {
    value: string;
    placeholder?: string;
    changed: (newValue: string) => void;
}

@Component
class WysiwigEditor extends TsxComponent<WysiwigEditorArgs> implements WysiwigEditorArgs {
    @Prop() label!: string;
    @Prop() labelButtons!: DropdownButtonItemArgs[];
    @Prop() subtitle!: string;
    @Prop() value!: string;
    @Prop() placeholder!: string;
    @Prop() mandatory!: boolean;
    @Prop() marginType?: MarginType;
    @Prop() maxWidth?: number;
    @Prop() wrap!: boolean;
    @Prop() hint: string;
    @Prop() appendIcon: string;
    @Prop() prependIcon: string;
    @Prop() appendClicked: () => void;
    @Prop() prependClicked: () => void;
    @Prop() changed: (newValue: string) => void;
    skipTrigger: boolean = false;
    currentValue: string = this.value;

    raiseChangeEvent(value: string) {
        this.populateValidationDeclaration();
        if (this.skipTrigger) {
            this.skipTrigger = false;
            return;
        }

        if (this.changed != null && this.currentValue != value) {
            this.changed(value);
        }
    }

    mounted() {
        this.currentValue = this.value;
        var elem = $(this.$el).find("textarea");
        elem["trumbowyg"]({
            autogrow: true,
            lang: AppState.currentLanguageCode,
            svgPath: EsModuleImportHelper.getObj(svgIcons), //FIXME: chcek if working
            tagsToRemove: ["script", "link"],
            plugins: {
                resizimg: {
                    minSize: 16,
                    step: 4,
                },
                cleanPasteCustom: {},
                fontsize: {
                    sizeList: ["13px", "16px", "18px", "22px"],
                    allowCustomSize: true,
                },
            },
            btnsDef: {
                // Customizables dropdowns
                image: {
                    dropdown: ["insertImage", "uploadImage"],
                    ico: "insertImage",
                },
            },
            btns: [
                ["viewHTML"],
                ["undo", "redo"], // Only supported in Blink browsers
                ["formatting"],
                ["strong", "em"],
                ["fontsize", "foreColor", "backColor"],
                ["link"],
                ["image"],
                ["emoji"],
                ["noembed"],
                ["justifyLeft", "justifyCenter", "justifyRight", "justifyFull"],
                ["unorderedList", "orderedList"],
                ["horizontalRule"],
                ["removeformat"],
                ["fullscreen"],
                ["uploadFile"],
            ],
        });

        //Hack so that delete key on image acts more natural
        var activeImage;
        var innerEditor = $(this.$el).find(".trumbowyg-editor");
        innerEditor.on("click", function (e) {
            var clickTarget = e.target;
            if (clickTarget != null && clickTarget.nodeName == "IMG") {
                activeImage = $(clickTarget).addClass("wysiwig-img-selected");
            } else {
                if (activeImage != null) {
                    activeImage.removeClass("wysiwig-img-selected");
                }

                activeImage = null;
            }
        });

        $(this.$el)
            .find(".trumbowyg-editor")
            .on("keydown", function (e) {
                if (e.keyCode == 46) {
                    if (activeImage != null) {
                        $(activeImage).remove();
                    }

                    activeImage = null;
                } else {
                    if (activeImage != null) {
                        activeImage.removeClass("wysiwig-img-selected");
                    }

                    activeImage = null;
                }
            });

        var mySelf = this;
        elem.on("tbwchange", function () {
            mySelf.raiseChangeEvent(elem["trumbowyg"]("html"));
        });

        elem["trumbowyg"]("html", this.currentValue);
    }

    @Watch("value")
    updateValue() {
        this.currentValue = this.value;
    }

    beforeDestroy() {
        $(this.$el)["trumbowyg"]("destroy");
    }

    @Watch("value")
    onValueChanged(val: string, oldVal: string) {
        if (val != oldVal) {
            this.currentValue = val;

            let currentVal = $(this.$el).find("textarea")["trumbowyg"]("html");
            if (currentVal != val) {
                this.skipTrigger = true;
                $(this.$el)
                    .find("textarea")
                    ["trumbowyg"]("html", this.currentValue || "");
            }
        }
    }

    render(h) {
        return (
            <FormItemWrapper
                label={this.label}
                mandatory={this.mandatory}
                wrap={this.wrap}
                appendIcon={this.appendIcon}
                prependIcon={this.prependIcon}
                hint={this.hint}
                marginType={this.marginType}
                maxWidth={this.maxWidth}
                appendClicked={this.appendClicked}
                prependClicked={this.prependClicked}
                validationState={this.validationState}
                labelButtons={this.labelButtons}
                subtitle={this.subtitle}
            >
                <div data-rc={this.currentValue != null ? "hasval" : "empty"}>
                    <textarea></textarea>
                </div>
            </FormItemWrapper>
        );
    }
}

(function ($) {
    if ($["trumbowyg"]._uploadPluginInit) {
        return;
    } else {
        $["trumbowyg"]._uploadPluginInit = true;
    }

    $.extend(true, $["trumbowyg"], {
        langs: {
            en: {
                uploadImage: "Upload picture",
                uploadFile: "Upload file",
                file: "File",
                uploadError: "Error",
            },
            sk: {
                uploadImage: "Nahrať obrázok",
                uploadFile: "Nahrať súbor",
                file: "Súbor",
                uploadError: "Chyba",
            },
            cs: {
                uploadImage: "Nahrát obrázek",
                uploadFile: "Nahrát soubor",
                file: "Soubor",
                uploadError: "Chyba",
            },
            zh_cn: {
                upload: "上传",
                file: "文件",
                uploadError: "错误",
            },
        },
        plugins: {
            uploadImage: {
                init: function (trumbowyg) {
                    trumbowyg.o.plugins.uploadImage = $.extend(true, {}, {}, trumbowyg.o.plugins.upload || {});
                    var btnDef = {
                        ico: "upload",
                        fn: function () {
                            trumbowyg.saveRange();

                            FileManagerDialog.show({
                                fileType: FileManagerModalFileType.Image,
                                callback: function (data) {
                                    trumbowyg.execCmd("insertImage", data.url, false, true);
                                },
                            });
                        },
                    };
                    trumbowyg.addBtnDef("uploadImage", btnDef);
                },
            },
            uploadFile: {
                init: function (trumbowyg) {
                    trumbowyg.o.plugins.uploadFile = $.extend(true, {}, {}, trumbowyg.o.plugins.upload || {});
                    var btnDef = {
                        ico: "upload",
                        fn: function () {
                            trumbowyg.saveRange();

                            FileManagerDialog.show({
                                fileType: FileManagerModalFileType.All,
                                callback: function (data) {
                                    trumbowyg.execCmd("createLink", data.url, false, true);
                                },
                            });
                        },
                    };
                    trumbowyg.addBtnDef("uploadFile", btnDef);
                },
            },
        },
    });
})(jQuery);
(function ($) {
    "use strict";

    var defaultOptions = {
        minSize: 32,
        step: 4,
    };

    var preventDefault = function (ev) {
        return ev.preventDefault();
    };

    $.extend(true, $["trumbowyg"], {
        plugins: {
            resizimg: {
                init: function (trumbowyg) {
                    trumbowyg.o.plugins.resizimg = $.extend(true, {}, defaultOptions, trumbowyg.o.plugins.resizimg || {}, {
                        resizable: {
                            resizeWidth: false,
                            onDragStart: function (ev, $el) {
                                var opt = trumbowyg.o.plugins.resizimg;
                                var x = ev.pageX - $el.offset().left;
                                var y = ev.pageY - $el.offset().top;
                                if (x < $el.width() - opt.minSize || y < $el.height() - opt.minSize) {
                                    return false;
                                }
                            },
                            onDrag: function (ev, $el, newWidth, newHeight) {
                                var opt = trumbowyg.o.plugins.resizimg;
                                if (newHeight < opt.minSize) {
                                    newHeight = opt.minSize;
                                }
                                newHeight -= newHeight % opt.step;
                                $el.height(newHeight);
                                return false;
                            },
                            onDragEnd: function () {
                                trumbowyg.syncCode();
                            },
                        },
                    });

                    function initResizable() {
                        trumbowyg.$ed.find("img").each(function (this: any) {
                            var img = $(this);
                            if (img.hasClass("res-bound")) {
                                return;
                            }

                            img.addClass("res-bound");
                            img["resizableLite"]({
                                resizeWidth: false,
                                onDragStart: function (ev, $el) {
                                    var opt = trumbowyg.o.plugins.resizimg;
                                    var x = ev.pageX - $el.offset().left;
                                    var y = ev.pageY - $el.offset().top;
                                    if (x < $el.width() - opt.minSize || y < $el.height() - opt.minSize) {
                                        return false;
                                    }
                                },
                                onDrag: function (ev, $el, newWidth, newHeight) {
                                    var opt = trumbowyg.o.plugins.resizimg;
                                    if (newHeight < opt.minSize) {
                                        newHeight = opt.minSize;
                                    }
                                    newHeight -= newHeight % opt.step;
                                    $el.height(newHeight);
                                    return false;
                                },
                                onDragEnd: function () {
                                    trumbowyg.syncCode();
                                },
                            });
                        });
                    }

                    function destroyResizable() {
                        trumbowyg.$ed.find("img").removeClass("res-bound").resizableLite("destroy").off("mousedown", preventDefault).removeClass("resizable");
                        trumbowyg.syncTextarea();
                    }

                    trumbowyg.$c.on("tbwinit", initResizable);
                    trumbowyg.$c.on("tbwfocus", initResizable);
                    trumbowyg.$c.on("tbwchange", initResizable);
                    trumbowyg.$c.on("tbwblur", destroyResizable);
                    trumbowyg.$c.on("tbwclose", destroyResizable);
                },
            },
        },
    });
})(jQuery);
(function ($) {
    $.fn["resizableLite"] = function fnResizable(options) {
        var defaultOptions = {
            // selector for handle that starts dragging
            handleSelector: null,
            // resize the width
            resizeWidth: true,
            // resize the height
            resizeHeight: true,
            // the side that the width resizing is relative to
            resizeWidthFrom: "right",
            // the side that the height resizing is relative to
            resizeHeightFrom: "bottom",
            // hook into start drag operation (event passed)
            onDragStart: null,
            // hook into stop drag operation (event passed)
            onDragEnd: null,
            // hook into each drag operation (event passed)
            onDrag: null,
            // disable touch-action on $handle
            // prevents browser level actions like forward back gestures
            touchActionNone: true,
            // instance id
            instanceId: null,
        };
        if (typeof options == "object") defaultOptions = $.extend(defaultOptions, options);

        return this.each(function () {
            var opt = $.extend({}, defaultOptions);
            if (!opt.instanceId) opt.instanceId = "rsz_" + new Date().getTime();

            var startPos, startTransition;

            // get the element to resize
            var $el = $(this);
            var $handle;

            if (options === "destroy") {
                opt = $el.data("resizable");
                if (!opt) return;

                $handle = getHandle(opt.handleSelector, $el);
                $handle.off("mousedown." + opt.instanceId + " touchstart." + opt.instanceId);
                if (opt.touchActionNone) $handle.css("touch-action", "");
                $el.removeClass("resizable");
                return;
            }

            $el.data("resizable", opt);

            // get the drag handle

            $handle = getHandle(opt.handleSelector, $el);

            if (opt.touchActionNone) $handle.css("touch-action", "none");

            $el.addClass("resizable");
            $handle.on("mousedown." + opt.instanceId + " touchstart." + opt.instanceId, startDragging);

            function noop(e) {
                e.stopPropagation();
                e.preventDefault();
            }

            function startDragging(e) {
                // Prevent dragging a ghost image in HTML5 / Firefox and maybe others
                if (e.preventDefault) {
                    e.preventDefault();
                }

                startPos = getMousePos(e);
                startPos.width = parseInt($el.width() as any, 10);
                startPos.height = parseInt($el.height() as any, 10);

                startTransition = $el.css("transition");
                $el.css("transition", "none");

                if (opt.onDragStart) {
                    if (opt.onDragStart(e, $el, opt) === false) return;
                }

                $(document).on("mousemove." + opt.instanceId, doDrag);
                $(document).on("mouseup." + opt.instanceId, stopDragging);
                if (window["Touch"] || navigator.maxTouchPoints) {
                    $(document).on("touchmove." + opt.instanceId, doDrag);
                    $(document).on("touchend." + opt.instanceId, stopDragging);
                }
                $(document).on("selectstart." + opt.instanceId, noop); // disable selection
                $("iframe").css("pointer-events", "none");
            }

            function doDrag(e) {
                var pos = getMousePos(e),
                    newWidth,
                    newHeight;

                if (opt.resizeWidthFrom === "left") newWidth = startPos.width - pos.x + startPos.x;
                else newWidth = startPos.width + pos.x - startPos.x;

                if (opt.resizeHeightFrom === "top") newHeight = startPos.height - pos.y + startPos.y;
                else newHeight = startPos.height + pos.y - startPos.y;

                if (!opt.onDrag || opt.onDrag(e, $el, newWidth, newHeight, opt) !== false) {
                    if (opt.resizeHeight) $el.height(newHeight);

                    if (opt.resizeWidth) $el.width(newWidth);
                }
            }

            function stopDragging(e) {
                e.stopPropagation();
                e.preventDefault();

                $(document).off("mousemove." + opt.instanceId);
                $(document).off("mouseup." + opt.instanceId);

                if (window["Touch"] || navigator.maxTouchPoints) {
                    $(document).off("touchmove." + opt.instanceId);
                    $(document).off("touchend." + opt.instanceId);
                }
                $(document).off("selectstart." + opt.instanceId, noop);

                // reset changed values
                $el.css("transition", startTransition);
                $("iframe").css("pointer-events", "auto");

                if (opt.onDragEnd) opt.onDragEnd(e, $el, opt);

                return false;
            }

            function getMousePos(e) {
                var pos = { x: 0, y: 0, width: 0, height: 0 };
                if (typeof e.clientX === "number") {
                    pos.x = e.clientX;
                    pos.y = e.clientY;
                } else if (e.originalEvent.touches) {
                    pos.x = e.originalEvent.touches[0].clientX;
                    pos.y = e.originalEvent.touches[0].clientY;
                } else return null;

                return pos;
            }

            function getHandle(selector, $el) {
                if (selector && selector.trim()[0] === ">") {
                    selector = selector.trim().replace(/^>\s*/, "");
                    return $el.find(selector);
                }

                // Search for the selector, but only in the parent element to limit the scope
                // This works for multiple objects on a page (using .class syntax most likely)
                // as long as each has a separate parent container.
                return selector ? $el.parent().find(selector) : $el;
            }
        });
    };
})(jQuery);

export default toNative(WysiwigEditor);
