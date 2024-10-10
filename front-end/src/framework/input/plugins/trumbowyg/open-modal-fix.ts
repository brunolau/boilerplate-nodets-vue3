(function ($) {
    "use strict";

    $.extend(true, ($ as any).trumbowyg, {
        plugins: {
            openModalFix: {
                init: function (trumbowyg) {
                    var CONFIRM_EVENT = "tbwconfirm",
                        CANCEL_EVENT = "tbwcancel";

                    trumbowyg.openModal = function (title, content, buildForm) {
                        var t = this,
                            prefix = t.o.prefix;

                        buildForm = buildForm !== false;

                        // No open a modal box when exist other modal box
                        if ($("." + prefix + "modal-box", t.$box).length > 0) {
                            return false;
                        }
                        if (t.o.autogrowOnEnter) {
                            t.autogrowOnEnterDontClose = true;
                        }

                        t.saveRange();
                        t.showOverlay();

                        // Disable all btnPane btns
                        t.$btnPane.addClass(prefix + "disable");

                        // Build out of ModalBox, it's the mask for animations
                        var $modal = $("<div/>", {
                            class: prefix + "modal " + prefix + "fixed-top",
                        })
                            .css({
                                //top: t.$box.offset().top + t.$btnPane.height(),
                                zIndex: 99999,
                            })
                            .appendTo($(t.$box));
                        //}).appendTo($(t.doc.body));

                        var darkClass = prefix + "dark";
                        if (t.$c.parents("." + darkClass).length !== 0) {
                            $modal.addClass(darkClass);
                        }

                        // Click on overlay close modal by cancelling them
                        t.$overlay.one("click", function () {
                            $modal.trigger(CANCEL_EVENT);
                            return false;
                        });

                        // Build the form
                        var formOrContent;
                        if (buildForm) {
                            formOrContent = $("<form/>", {
                                action: "",
                                html: content,
                            })
                                .on("submit", function () {
                                    $modal.trigger(CONFIRM_EVENT);
                                    return false;
                                })
                                .on("reset", function () {
                                    $modal.trigger(CANCEL_EVENT);
                                    return false;
                                })
                                .on("submit reset", function () {
                                    if (t.o.autogrowOnEnter) {
                                        t.autogrowOnEnterDontClose = false;
                                    }
                                });
                        } else {
                            formOrContent = content;
                        }

                        // Build ModalBox and animate to show them
                        var $box = $("<div/>", {
                            class: prefix + "modal-box",
                            html: formOrContent,
                        })
                            .css({
                                top: "-" + t.$btnPane.outerHeight(),
                                opacity: 0,
                                paddingBottom: buildForm ? null : "5%",
                            })
                            .appendTo($modal)
                            .animate(
                                {
                                    top: 0,
                                    opacity: 1,
                                },
                                100
                            );

                        // Append title
                        if (title) {
                            $("<span/>", {
                                text: title,
                                class: prefix + "modal-title",
                            }).prependTo($box);
                        }

                        if (buildForm) {
                            // Focus in modal box
                            $(":input:first", $box).focus();

                            // Append Confirm and Cancel buttons
                            t.buildModalBtn("submit", $box);
                            t.buildModalBtn("reset", $box);

                            $modal.height($box.outerHeight() + 10);
                        }

                        $(window).trigger("scroll");
                        t.$c.trigger("tbwmodalopen");

                        return $modal;
                    };

                    const kokot = trumbowyg;
                    const pica = kokot;
                },
            },
        },
    });
})(jQuery);
