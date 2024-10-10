export default class DropdownUtils {
    static bindDropdownOverflowHack(selector: string, cacheKey: string, hide: boolean): void {
        if (DropdownUtils[cacheKey] == null) {
            DropdownUtils[cacheKey] = true;

            $(document)
                .on("show.bs.dropdown", selector, function () {
                    //original dropdown element
                    var thisDropdown = $(this);
                    var thisDropdownCopy = thisDropdown.clone(true, true);
                    var ddItems = thisDropdownCopy.find("a");
                    var originalItems = thisDropdown.find("a");
                    var randomId = "dd" + portalUtils.randomString(10);
                    thisDropdown.attr("data-hcid", randomId);
                    thisDropdownCopy.attr("data-hcid", randomId + "-clone");

                    for (var i = 0, len = ddItems.length; i < len; i++) {
                        let clonedAnchor = $(ddItems[i]);
                        let originalAnchor = $(originalItems[i]);

                        clonedAnchor.click(function (e) {
                            originalAnchor[0].click();

                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            return false;
                        });
                    }

                    $("body").append(
                        thisDropdownCopy.addClass(randomId + " show").css({
                            position: "absolute",
                            left: thisDropdown.offset().left,
                            top: thisDropdown.offset().top - 10,
                        }),
                    );

                    if (hide) {
                        thisDropdown.css("visibility", "hidden");
                        $(this).hide();
                    }
                })
                .on("hidden.bs.dropdown", ".dropdown", function (e) {
                    let id = $(this).attr("data-hcid") || "";
                    if (id.endsWith("-clone")) {
                        let originalId = id.replace("-clone", "");
                        let originalDropdown = $("[data-hcid='" + originalId + "']");
                        originalDropdown.css("visibility", "").show();
                        $(this).remove();

                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        return false;
                    }
                });
        }
    }
}
