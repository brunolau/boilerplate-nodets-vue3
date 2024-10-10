import { PERMISSION, PERMISSION_GROUP } from "../../api/data-contracts/enums";
import AppRoutes from "../../app-routes";
import { AppMenuSetRouteDriven, AppMenuItemRouteDriven } from "../../framework/app/menu-base";
import PermissionUtil from "../../utils/permissionUtil";

const EVENT_ID_KEY = ":eventId"; //for query string driven
export class AppMenuSet {
    private static _instance: AppMenuSet;
    private _menuSet: AppMenuSetRouteDriven;

    private constructor() {
        this._menuSet = new AppMenuSetRouteDriven(this.getTree(), this.getUrl, this.isVisible);
    }

    static get instance(): AppMenuSet {
        if (!AppMenuSet._instance) {
            AppMenuSet._instance = new AppMenuSet();
        }

        return AppMenuSet._instance;
    }

    get menuItems(): AppMenuItem[] {
        return this._menuSet.menuItems;
    }

    private getTree(): AppMenuItemRouteDriven[] {
        const retArr: AppMenuItemRouteDriven[] = [];
        const permissionGroups: PERMISSION_GROUP[] = [];

        if (!AppState.user) return [];

        for (const perm of AppState.user.Profile.permissions || []) {
            const permGroup: PERMISSION_GROUP = perm.groupKey as any;

            if (!permissionGroups.contains(permGroup)) {
                permissionGroups.push(permGroup);
            }
        }


        const hasPermission = (requiredPerm: PERMISSION_GROUP): boolean => {
            return permissionGroups.find((p) => p == requiredPerm) != null;
        };

        const addMenuItem = (route: AppMenuItemRouteDriven, requiredPerm: PERMISSION_GROUP): void => {
            if (PermissionUtil.hasPermission(PERMISSION.ADMIN) || PermissionUtil.hasPermission(PERMISSION.SUPER_ADMIN)) {
                retArr.push(route);
                return;
            }

            if (requiredPerm == null) {
                retArr.push(route);
                return;
            }

            if (hasPermission(requiredPerm)) {
                retArr.push(route);
            }
        };

        addMenuItem({ text: AppState.resources.menuHome, icon: "fas fa-home", route: AppRoutes.helloWorld }, null);
        addMenuItem({ text: AppState.resources.menuAds, icon: "fas fa-calendar", route: AppRoutes.ads }, null); // add permission

        return retArr;
    }

    private getUrl(item: AppMenuItemRouteDriven): string {
        let routerRoute = AppState.router.currentRoute;
        if (routerRoute != null) {
            let eventId = AppMenuSet._instance.getEventId();
            if (eventId != null) {
                let path = item.route != null ? item.route.path : item.staticUrl;
                return (path + (item.routeUrlArgs || "")).replace(EVENT_ID_KEY, Array.isArray(eventId) ? eventId[0] : eventId);
            }
        }

        if (item.route != null) {
            return item.route.path;
        }

        return item.staticUrl;
    }

    private getEventId() {
        let routerRoute = AppState.router.currentRoute;
        if (routerRoute != null) {
            return routerRoute.value.params.eventId;
        }

        return null;
    }

    private isVisible(item: AppMenuItemRouteDriven): boolean {
        let path = item.route != null ? item.route.path : item.staticUrl;
        if (isNullOrEmpty(path)) {
            if (item.onClick == null || AppMenuSet._instance.getEventId() != null) {
                return true;
            } else {
                return false;
            }
        }

        if (path.contains(EVENT_ID_KEY)) {
            let routerRoute = AppState.router.currentRoute;
            if (routerRoute == null) {
                return false;
            }

            return !isNullOrEmpty(routerRoute.value.params.eventId);
        }

        return true;
    }
}
