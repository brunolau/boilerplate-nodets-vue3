class AppRouterAccessor {
    static get instance(): IAppRouter {
        return window["AppRouter"];
    }
}

window["AppRouterAccessor"] = AppRouterAccessor;
