import VueRouter, { RouteRecordNameGeneric } from "vue-router";
import { Vue } from "vue-facing-decorator";

declare global {
    interface IVueRouter extends VueRouter.Router {}

    type VUEE = typeof Vue.prototype;

    interface IVue extends VUEE {}

    interface IAppRouter {
        readonly currentRouter: IVueRouter;
        getRouteByName(name: RouteRecordNameGeneric): IAppRoute;
        getPossibleInitialRoute(): IAppRoute;
    }

    interface IAppRoute {
        path: string;
        component: any;
        name: string;
        alias?: string[];
        meta?: any;
        hideMenu?: boolean;
        hideHeader?: boolean;
        fullScreen?: boolean;
        title?: () => string;
        subtitle?: () => string;
    }
}
