import appConfig from "src/config/appConfig";
import { ControllerGetMiddlewares, ExpressGetIpAddress, ExpressRequest, ExpressResponse } from "src/utils/express-utils";
import { rateLimit } from 'express-rate-limit'


export function RequestRateLimit(args: { getKey?: (req: ExpressRequest, res: ExpressResponse) => string, uuid: string }) {
    return (target: any) => {
        if (appConfig.rateLimit.enabled) {
            const middlewares = ControllerGetMiddlewares(target);

            middlewares.unshift(rateLimit({
                legacyHeaders: false,
                standardHeaders: false,
                windowMs: appConfig.rateLimit.windowMs,
                limit: appConfig.rateLimit.throughPut,
                keyGenerator: (req, res): Promise<string> => {
                    return new Promise(resolve => {
                        if (args.getKey != null) {
                            resolve(args.getKey(req, res))
                        } else {
                            resolve(args.uuid + '-' + ExpressGetIpAddress(req) + '-' + req.query?.hotelId + '-' + req.params?.hotelId);
                        }
                    });
                }
            }))
        }
    }
}
