export interface AppMenuItemRouteDriven {
    text?: string;
    icon?: string;
    iconHtml?: string;
    type?: AppMenuType;
    children?: AppMenuItemRouteDriven[];
    route?: IAppRoute;
    routeUrlArgs?: string;
    staticUrl?: string;
    onClick?: () => void;
}

export class AppMenuSetRouteDriven {
    private _menuTree: AppMenuItemRouteDriven[];
    private _getUrl: (item: AppMenuItemRouteDriven) => string;
    private _isVisible: (item: AppMenuItemRouteDriven) => boolean;

    public constructor(menuTree: AppMenuItemRouteDriven[], getUrl: (item: AppMenuItemRouteDriven) => string, isVisible: (item: AppMenuItemRouteDriven) => boolean) {
        this._menuTree = menuTree;
        this._getUrl = getUrl;
        this._isVisible = isVisible;
    }

    get menuItems(): AppMenuItem[] {
        var retVal: AppMenuItem[] = [];
        var activeRoute = AppState.currentAppRoute;
        this.buildCurrentMenuSet(retVal, this._menuTree, null, activeRoute);
        return retVal;
    }

    buildCurrentMenuSet(targetArr: AppMenuItem[], sourceArr: AppMenuItemRouteDriven[], parentItem: AppMenuItem, activeRoute: IAppRoute) {
        sourceArr.forEach((item) => {
            var isVisible = this._isVisible(item);
            var hasStaticUrl = !isNullOrEmpty(item.staticUrl);

            if (isVisible) {
                var hasPath = item.route != null || hasStaticUrl;
                var menuItem: AppMenuItem = {
                    text: item.text,
                    icon: item.icon,
                    iconHtml: item.iconHtml,
                    type: item.type,
                    onClick: item.onClick,
                    routerPath: item.route != null,
                    url: hasPath ? this._getUrl(item) : null,
                };

                if (activeRoute != null && item.route != null) {
                    if (activeRoute.name == item.route.name) {
                        menuItem.active = true;
                    }
                }

                if (!isNullOrEmpty(item.children)) {
                    menuItem.children = [];
                    this.buildCurrentMenuSet(menuItem.children, item.children, menuItem, activeRoute);
                }

                if (menuItem.active && parentItem != null) {
                    parentItem.active = true;
                }

                targetArr.push(menuItem);
            }
        });
    }
}
