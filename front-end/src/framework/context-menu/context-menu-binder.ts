import "jquery-contextmenu/dist/jquery.contextMenu.js";
import "jquery-contextmenu/dist/jquery.ui.position.js";
import "jquery-contextmenu/dist/jquery.contextMenu.min.css";

export interface ContextMenuArgs {
    selector: string;
    build: ($trigger: JQuery, e: JQuery.Event) => ContextMenuBuildResponse;
}

export interface ContextMenuBuildResponse {
    callback: (key: string, options: any) => void;
    items: ContextMenuItem[];
}

export interface ContextMenuItem {
    key: string;
    text: string;
    icon?: "edit" | "cut" | "copy" | "paste" | "delete" | "add";
}

export default class ContextMenuBinder {
    static bindMenu(args: ContextMenuArgs): void {
        $["contextMenu"]({
            selector: args.selector,
            build: function ($trigger, e) {
                let result = args.build($trigger, e);
                let itemObj = {} as any;

                result.items.forEach((item) => {
                    itemObj[item.key] = {
                        name: item.text,
                        icon: item.icon,
                    };
                });

                return {
                    callback: result.callback,
                    items: itemObj,
                };
            },
        });
    }

    static destroyMenu(selector: string) {
        $["contextMenu"]("destroy", selector);
    }
}
