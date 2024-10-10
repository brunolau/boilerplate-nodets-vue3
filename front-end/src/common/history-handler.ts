(() => {
    import("jquery").then((jq) => {
        const $ = jq.default;
        let openArr: string[] = [];
        let skipModalHideCount = 0;
        let skipHistoryCount = 0;

        let initializer = {
            intializeModalListener() {
                $(document).on("show.bs.modal", ".modal", function (this: any) {
                    if ($(this).attr("data-preventhistory") == "true") {
                        return;
                    }

                    let handleUUID = portalUtils.randomString(16);
                    $(this).attr("data-hist-uuid", handleUUID);
                    openArr.push(handleUUID);

                    window.history.pushState(
                        {
                            modalId: handleUUID,
                        },
                        null,
                        null
                    );
                });

                $(document).on("fdd-show", function (this: any, e: any, context: JQuery) {
                    let handleUUID = portalUtils.randomString(16);
                    $(context).attr("data-hist-uuid", handleUUID);
                    openArr.push(handleUUID);

                    window.history.pushState(
                        {
                            fddId: handleUUID,
                        },
                        null,
                        null
                    );
                });

                $(document).on("hide.bs.modal", ".modal", function (this: any) {
                    if ($(this).attr("data-preventhistory") == "true") {
                        return;
                    }

                    let handleUUID = $(this).attr("data-hist-uuid");
                    openArr.remove(handleUUID);

                    if (skipModalHideCount > 0) {
                        skipModalHideCount -= 1;
                    } else {
                        skipHistoryCount += 1;
                        window.history.back();
                    }
                });

                $(document).on("fdd-hide", function (this: any, e: any, context: JQuery) {
                    let handleUUID = $(this).attr("data-hist-uuid");
                    openArr.remove(handleUUID);

                    if (skipModalHideCount > 0) {
                        skipModalHideCount -= 1;
                    } else {
                        skipHistoryCount += 1;
                        window.history.back();
                    }
                });

                window.addEventListener("popstate", function (e) {
                    let state = e.state;
                    if (state != null && !isNullOrEmpty(state.modalId)) {
                        let modalElem = $("[data-hist-uuid='" + state.modalId + "']");
                        if (modalElem.length > 0 && !modalElem.hasClass("show")) {
                            modalElem.show();
                            return;
                        }
                    }

                    if (state != null && !isNullOrEmpty(state.fddId)) {
                        return;
                    }

                    if (skipHistoryCount > 0) {
                        skipHistoryCount -= 1;
                        //history.replaceState({ "obsolete": true }, "");
                        //setTimeout(() => {
                        //history.pushState(null, document.title, location.href);
                        //}, 20);
                    } else {
                        let handleUUID = openArr.pop();
                        if (!isNullOrEmpty(handleUUID)) {
                            skipModalHideCount += 1;

                            let context = $("[data-hist-uuid='" + handleUUID + "']");
                            if (context.hasClass("modal")) {
                                context.hide();
                            } else if (context.attr("id") == "filterableSelectDropDown") {
                                $("#btn_fdd_FddCancel").click();
                            }
                        }

                        //history.replaceState({ "obsolete": true }, "");
                        //setTimeout(() => {
                        //    history.pushState(null, document.title, location.href);
                        //}, 20);
                    }
                });
            },
        };

        //Modal stacking handler
        $(document).on("show.bs.modal", ".modal", function (this: any) {
            var $this = $(this);
            var highestZ = 0;

            $(".modal:visible").each(function (this: HTMLElement) {
                let zi = this.style.zIndex;
                if (zi != null && zi.length > 0) {
                    let numZi = Number(zi);
                    if (numZi > highestZ && numZi > 1049) {
                        highestZ = numZi;
                    }
                }
            });

            if (highestZ < 1049) {
                highestZ = 1049;
            }

            var zIndex = highestZ + 2;
            $this.css("z-index", zIndex);
            setTimeout(function () {
                $(".modal-backdrop")
                    .not(".modal-stack")
                    .css("z-index", zIndex - 1)
                    .addClass("modal-stack");
            }, 0);
        });

        $(document).on("hidden.bs.modal", ".modal", function (this: any) {
            $(this).css("z-index", "");
        });

        //if (portalUtils.treatAsMobileDevice()) {
        initializer.intializeModalListener();
        //}

        // window['HistoryHandlerExt'] = historyHandler;
    });
})();
