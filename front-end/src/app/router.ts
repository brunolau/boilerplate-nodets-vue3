import VueRouter, { createRouter, createWebHistory } from "vue-router";
import AppRoutes from "./../app-routes";
import NProgress from "nprogress";
import "./../../node_modules/nprogress/nprogress.css";

namespace AppRouterUtils {
    let initialized = false;
    let currentRouter: VueRouter.Router = null;
    let previousRoute: VueRouter.RouteLocationNormalizedLoadedGeneric = null;
    let nextTo: VueRouter.RouteLocationNormalizedLoadedGeneric = null;

    function getRouteId(route: AppRoute): string {
        if (route.name != null && route.name.length > 0) {
            return route.name;
        } else {
            return route.path.split("/")[1];
        }
    }

    export function getRouteByName(name: string): AppRoute {
        for (var key in AppRoutes) {
            var item: AppRoute = AppRoutes[key];
            if (item.name == name) {
                return item;
            }
        }

        return null;
    }

    export function getPossibleInitialRoute(): AppRoute {
        try {
            var locPath = "/" + location.pathname.split("/")[1] + "/";
            for (var key in AppRoutes) {
                var item: AppRoute = AppRoutes[key];
                if (item.path.startsWith(locPath)) {
                    return item;
                } else if (item.path + "/" == locPath) {
                    return item;
                } else if (item.path == locPath) {
                    return item;
                }
            }

            return null;
        } catch (e) {
            return null;
        }
    }

    export function getPreviousRoute(): IAppRoute {
        if (previousRoute == null) {
            return null;
        }

        return getRouteByName(previousRoute.name as string);
    }

    function getRoutes(): AppRoute[] {
        var retVal = [];
        for (var key in AppRoutes) {
            var route: AppRoute = AppRoutes[key];
            if (route.path.indexOf("/") != 0) {
                console.error("Route invalid [" + route.path + "]");
            }

            retVal.push(AppRoutes[key]);
        }

        return retVal;
    }

    function handlePageSpecificClass(to, from) {
        var toRoute: AppRoute = getRouteByName(to.name);
        var clsList = document.body.classList;

        clsList.remove("inv-no-menu");
        clsList.remove("inv-no-header");
        clsList.remove("inv-full-screen");

        if (toRoute != null) {
            if (toRoute.hideHeader == true) {
                clsList.add("inv-no-header");
            }

            if (toRoute.hideMenu == true && !AppState.user) {
                clsList.add("inv-no-menu");
            }

            if (toRoute.fullScreen == true) {
                clsList.add("inv-full-screen");
            }
        }

        document.body.classList.remove("apg-" + getRouteId(from));
        document.body.classList.add("apg-" + getRouteId(to));
    }

    function createNewRouter(): VueRouter.Router {
        const router = createRouter({
            history: createWebHistory(),
            routes: getRoutes(),
        });

        router.onError((err) => {
            if (err.name == "ChunkLoadError") {
                const lastTry = Number(localStorage.getItem("errLastReload") || "0");
                if (new Date().getTime() - lastTry > 3000) {
                    localStorage.setItem("errLastReload", new Date().getTime().toString());

                    if (nextTo != null && !isNullOrEmpty(nextTo.path)) {
                        location.href = nextTo.path;
                    } else {
                        location.reload();
                    }
                }
            }
        });

        router.beforeEach((to, from, next) => {
            nextTo = to;
            previousRoute = from;
            handlePageSpecificClass(to, from);
            next();
        });

        //Not the nicests way that hides menu after router page navigation on mobiles
        router.afterEach((to, from) => {
            NProgress.done();
            portalUtils.handleMobileMenuClick();
        });

        router.beforeResolve((to, from, next) => {
            // If this isn't an initial page load.
            if (to.name) {
                if (portalUtils.treatAsMobileDevice()) {
                    let loaderContainer = $(".mobileLoader");
                    loaderContainer.addClass("mobileLoaderActive").html(AppConfig.blockerHtml);
                }

                NProgress.start();
            }
            next();
        });

        router.afterEach((to, from) => {
            if (portalUtils.treatAsMobileDevice()) {
                let loaderContainer = $(".mobileLoader");
                loaderContainer.removeClass("mobileLoaderActive").html("");
            }
        });

        initialized = true;

        return router;
    }

    export function getRouter(): VueRouter.Router {
        if (currentRouter == null) {
            currentRouter = createNewRouter();
        }

        return currentRouter;
    }
}

export interface AppRoute {
    path: string;
    component: any;
    name: string;
    title?: () => string;
    hideMenu?: boolean;
    hideHeader?: boolean;
    fullScreen?: boolean;
}

class AppRouterImpl implements IAppRouter {
    get currentRouter(): VueRouter.Router {
        return AppRouterUtils.getRouter();
    }

    get previousRoute(): IAppRoute {
        return AppRouterUtils.getPreviousRoute();
    }

    getRouteByName(name: string): AppRoute {
        return AppRouterUtils.getRouteByName(name);
    }

    getPossibleInitialRoute(): AppRoute {
        return AppRouterUtils.getPossibleInitialRoute();
    }
}

window["AppRouter"] = new AppRouterImpl();
