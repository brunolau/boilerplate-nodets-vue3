import { App } from "vue";

export const TopLevelPagePlugin = {
    install(app: App<Element>) {
        app.mixin({
            mounted() {
                if (this.topLevel == true) {
                    let mySelf = this as any;
                    let appEntryComponent = this.$root;
                    appEntryComponent.breadcrumbItems = mySelf.breadcrumbItems;
                    appEntryComponent.menuItems = mySelf.menuItems;

                    var blocker = $(".loading-full-overlay");
                    if (blocker.length > 0) {
                        mySelf.$nextTick(() => {
                            setTimeout(() => {
                                blocker.addClass("fadeOutBlocker blockeranimated").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
                                    blocker.remove();
                                });
                            }, 375);

                            setTimeout(() => {
                                try {
                                    blocker.remove();
                                } catch (e) {}
                            }, 2500);
                        });
                    }
                }
            },
        });
    },
};
