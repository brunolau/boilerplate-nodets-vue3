(function ($) {
    "use strict";

    function cleanIt(html) {
        const bodyIndex = html.indexOf("<body");
        if (bodyIndex > -1) {
            const endIndex = html.indexOf("</body>");
            html = html.substring(html.indexOf(">", bodyIndex) + 1, endIndex).trim();
        }

        if (html.indexOf("<") != 0) {
            const kokot = html;
        }

        const jqHtml = $("<div>" + html + "</div>");
        const removeStyleRec = (item: HTMLElement) => {
            const $elem = $(item);
            $elem.children().each(function () {
                removeStyleRec(this);
            });

            item.removeAttribute("style");
            item.removeAttribute("class");
        };

        let htmlBuilder = "";
        removeStyleRec(jqHtml[0]);

        jqHtml.children().each(function () {
            htmlBuilder += this.outerHTML;
        });

        if (jqHtml.children().length > 1) {
            return "<div>" + htmlBuilder + "</div>";
        } else {
            return htmlBuilder;
        }
    }

    function considerEmpty(html) {
        return (html || "").length < 20;
    }

    // clean editor
    // this will clean the inserted contents
    // it does a compare, before and after paste to determine the
    // pasted contents
    $.extend(true, ($ as any).trumbowyg, {
        plugins: {
            cleanPasteCustom: {
                init: function (trumbowyg) {
                    trumbowyg.pasteHandlers.push(function (pasteEvent) {
                        const pastedData = (pasteEvent.originalEvent || pasteEvent).clipboardData.getData("text/html");
                        if (isNullOrEmpty(pastedData)) {
                            return;
                        }

                        try {
                            trumbowyg.saveRange();

                            let node = trumbowyg.doc.getSelection().focusNode,
                                range = trumbowyg.doc.createRange(),
                                cleanedPaste = cleanIt(pastedData.trim()),
                                newNode = $(cleanedPaste)[0] || trumbowyg.doc.createTextNode(cleanedPaste);

                            if (considerEmpty(trumbowyg.$ed.html())) {
                                // simply append if there is no content in editor
                                trumbowyg.$ed.html("");
                                trumbowyg.$ed[0].appendChild(newNode);
                            } else {
                                // insert pasted content behind last focused node
                                range.setStartAfter(node);
                                range.setEndAfter(node);
                                trumbowyg.doc.getSelection().removeAllRanges();
                                trumbowyg.doc.getSelection().addRange(range);

                                trumbowyg.range.insertNode(newNode);
                            }

                            // now set cursor right after pasted content
                            range = trumbowyg.doc.createRange();
                            range.setStartAfter(newNode);
                            range.setEndAfter(newNode);
                            trumbowyg.doc.getSelection().removeAllRanges();
                            trumbowyg.doc.getSelection().addRange(range);

                            // prevent defaults
                            pasteEvent.stopPropagation();
                            pasteEvent.preventDefault();

                            // save new node as focused node
                            trumbowyg.saveRange();
                            trumbowyg.syncCode();
                        } catch (c) {
                            console.error(c);
                        }
                        // }, 1);
                    });
                },
            },
        },
    });
})(jQuery);
