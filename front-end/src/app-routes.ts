export default class AppRoutes {
    //Test pages x3
    static readonly counter: IAppRoute = {
        name: "counter",
        path: "/testspa/counter",
        title: () => "Test counter",
        component: () => import("./framework/counter/index"),
    };

    static readonly fetchData: IAppRoute = {
        name: "fetchData",
        path: "/testspa/fetchdata",
        component: () => import("./framework/counter/fetchdata"),
    };

    static readonly testAllComponents: IAppRoute = {
        name: "testAllComponents",
        path: "/testspa/testall",
        component: () => import("./framework/counter/testall"),
    };

    //Hello world page
    static readonly helloWorld: IAppRoute = {
        name: "dashboard",
        path: "/",
        meta: { requiresAuth: false },
        title: () => "Dashboard",
        component: () => import("./pages/dashboard"),
    };

    /*-------------------------------------------------------------------*/
    /* === Account pages === */

    //Login page (username and pw, for admin access)
    static readonly loginActiveDirectory: IAppRoute = {
        name: "login",
        path: "/login",
        alias: ["/login/:x*"],
        fullScreen: true,
        meta: { requiresAuth: false },
        title: () => AppState.resources.login,
        component: () => import("./pages/account/login/login-ad"),
    };

    static readonly loginLegacy: IAppRoute = {
        name: "login-legacy",
        path: "/login-legacy",
        alias: ["/login-legacy/:x*"],
        fullScreen: true,
        meta: { requiresAuth: false },
        title: () => AppState.resources.login,
        component: () => import("./pages/account/login/login-legacy"),
    };

    static readonly forgotPassword: IAppRoute = {
        name: "forgot-password",
        path: "/forgot-password",
        alias: ["/forgot-password/:x*"],
        fullScreen: true,
        meta: { requiresAuth: false },
        title: () => AppState.resources.passwordRecovery,
        component: () => import("./pages/account/forgot-password"),
    };

    static readonly resetPassword: IAppRoute = {
        name: "reset-password",
        path: "/reset-password",
        alias: ["/reset-password/:x*"],
        fullScreen: true,
        meta: { requiresAuth: false },
        title: () => AppState.resources.passwordReset,
        component: () => import("./pages/account/reset-password"),
    };
}
