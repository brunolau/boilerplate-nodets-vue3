import express, { Request, Response, Router } from "express";
import appConfig from "src/config/appConfig";


interface CustomRequest {

}
export type ExpressRequest = Request<any, any, any, any, Record<string, any>> & CustomRequest


export type ExpressResponse = Response<any, Record<string, any>>;

export const ExpressParseQueryNumber = (req: ExpressRequest, key: string): number => {
    try {
        const retVal = Number(req.query[key]);
        if (isNaN(retVal)) {
            return null;
        }

        return retVal;
    } catch (error) {
        return null;
    }
}

export const ExpressParseQueryBoolean = (req: ExpressRequest, key: string): boolean => {
    return ['1', 'true'].indexOf(req.query[key]) > -1;
}

export const ExpressParseQueryString = (req: ExpressRequest, key: string): string => {
    return req.query[key];
}

export const ExpressParseQueryJSON = (req: ExpressRequest, key: string): any => {
    const val = req.query[key];
    if (val == null || val.length == 0) {
        return null;
    } else {
        return JSON.parse(val);
    }
}

export const ExpressParseQueryDate = (req: ExpressRequest, key: string): Date => {
    const date = new Date(req.query[key]);
    return isNaN(date.getTime()) ? null : date;
}

export const ExpressParseQueryArray = (req: ExpressRequest, key: string): any[] => {
	const val = req.query[key];
	if (val == null || val.length == 0) {
		return [];
	} else {
		return Array.isArray(val) ? val : [val];
	}
}

export const ExpressDumpRequest = (req: ExpressRequest, res?: ExpressResponse, writeResponse?: boolean, isError?: boolean) => {
    if (isError) {
        console.log("\n *** ERROR Request dump *** \n");
    } else {
        console.log("\n *** Request dump *** \n");
    }


    console.log("URL: " + req.url);
    console.log("Method: " + req.method);
    console.log("Headers: " + JSON.stringify(req.headers));
    console.log("Params: " + JSON.stringify(req.params));
    console.log("Query: " + JSON.stringify(req.query));
    console.log("Body: " + JSON.stringify(req.body));

    if (res && writeResponse) {
        return res.status(200).json({});
    }
}

export const ExpressGetIpAddress = (req: ExpressRequest): string => {
    return (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as any;
}

export const ControllerGetMiddlewares = (target: any): ((req: ExpressRequest, res: ExpressResponse, next: () => any) => any)[] => {
    let middlewares = target['$middlewares'];
    if (middlewares == null) {
        const arr: any[] = [];
        Object.defineProperty(target, '$middlewares', {
            get: function () {
                return arr;
            }
        });

        middlewares = target['$middlewares'];
    }

    return middlewares;
}

export interface IController {
    $route?: string
    $auth?: (req: ExpressRequest, res: ExpressResponse) => Promise<boolean>
    $requestSize?: string
    $middlewares?: ((req: ExpressRequest, res: ExpressResponse, next: () => any) => any)[]
    getAll?(req: ExpressRequest, res: ExpressResponse): Promise<void>
    get?(req: ExpressRequest, res: ExpressResponse): Promise<void>
    post?(req: ExpressRequest, res: ExpressResponse): Promise<void>
    put?(req: ExpressRequest, res: ExpressResponse): Promise<void>
    delete?(req: ExpressRequest, res: ExpressResponse): Promise<void>
}

export class ControllerBase implements IController {

}

export function Route(route: string) {
    return (target: any) => {
        Object.defineProperty(target, '$route', {
            get: function () {
                return route;
            }
        });
    }
}

export function RequestSize(size: string) {
    return (target: any) => {
        Object.defineProperty(target, '$requestSize', {
            get: function () {
                return size;
            }
        });
    }
}

export function Middleware(middlewares: ((req: ExpressRequest, res: ExpressResponse, next: () => any) => any)[]) {
    return (target: any) => {
        const arr = ControllerGetMiddlewares(target);
        for (const mw of middlewares) {
            arr.push(mw);
        }
    }
}

export class RouteBinder {
    static registerController<TController extends ControllerBase>(router: Router, controllerClass: new () => TController) {
        const controller: IController = new controllerClass();
        let route: string = controller.$route || (controller as any).constructor?.$route;

        if (!route) {
            route = controllerClass.name.replace('Controller', '');
            route = route.substring(0, 1).toLowerCase() + route.substring(1);
        }

        if (route.indexOf('/') != 0) {
            route = '/' + route;
        }

        this.bindMethod('getAll', router, controller, route);
        this.bindMethod('get', router, controller, route);
        this.bindMethod('post', router, controller, route);
        this.bindMethod('put', router, controller, route);
        this.bindMethod('delete', router, controller, route);
    }

    private static bindMethod<TController extends IController, K extends keyof IController>(method: K, router: Router, controller: TController, route: string) {
        if (!controller[method]) {
            return;
        }

        const auth: (req: ExpressRequest, res: ExpressResponse) => Promise<boolean> = controller.$auth || (controller as any).constructor?.$auth;
        const requestSize: string = controller.$requestSize || (controller as any).constructor?.$requestSize;
        let middlewares: ((req: ExpressRequest, res: ExpressResponse, next: () => any) => any)[] = controller.$middlewares || (controller as any).constructor?.$middlewares || [];

        if (requestSize) {
            middlewares.unshift(express.json({ limit: requestSize }));
            middlewares.unshift(express.urlencoded({ extended: true, limit: requestSize }));

        } else {
            middlewares.unshift(express.json());
            middlewares.unshift(express.urlencoded({ extended: true }));
        }

        if (auth != null) {
            middlewares.unshift(async (req, res, next) => {
                const authResult = await auth(req, res);
                if (!authResult) {
                    return res.status(401).send('Unauthorized access');
                }

                return next();
            })
        }

        if (middlewares?.length > 0) {
            let retVal: any;
            if (appConfig.logging.dumpErrorResponses) {
                retVal = (router as any)[method == 'getAll' ? 'get' : method](route, middlewares, async (req: ExpressRequest, res: ExpressResponse, next: () => any) => {
                    try {
                        return await (controller[method] as any).call(controller, req, res, next);
                    } catch (error) {
                        ExpressDumpRequest(req, res, false, true);
                        throw error;
                    }
                });
            } else {
                retVal = (router as any)[method == 'getAll' ? 'get' : method](route, middlewares, (controller[method] as any).bind(controller))
            }

            middlewares = null;
            return retVal;
        } else {
            if (appConfig.logging.dumpErrorResponses) {
                return (router as any)[method == 'getAll' ? 'get' : method](route, middlewares, async (req: ExpressRequest, res: ExpressResponse, next: () => any) => {
                    try {
                        return await (controller[method] as any).call(controller, req, res, next);
                    } catch (error) {
                        ExpressDumpRequest(req, res, false, true);
                        throw error;
                    }
                });
            } else {
                return (router as any)[method == 'getAll' ? 'get' : method](route, (controller[method] as any).bind(controller));
            }
        }
    }
}
