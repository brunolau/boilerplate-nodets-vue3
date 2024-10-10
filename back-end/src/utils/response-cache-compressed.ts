import express from 'express'
import AsyncLock from 'async-lock'
import NodeCache from 'node-cache'
import appConfig from 'src/config/appConfig'
import zlib from 'zlib';
import accepts from 'accepts';

const cacheRepository = new NodeCache({
    checkperiod: 30,
    useClones: false
})


const locker = new AsyncLock({ maxPending: 6000 })
interface ResponseCacheProviderArgs {
    bufferEncoding?: (req: express.Request, res: express.Response) => string
    timeToLiveMs: number
    shouldCache?: (req: express.Request, res: express.Response) => boolean
    getKey?: (req: express.Request, res: express.Response) => string
    contentType?: (req: express.Request, res: express.Response) => string
    compress?: (req: express.Request, res: express.Response) => boolean
}

const consoleLog = appConfig.responseCache.consoleLogging ? (msg: string) => console.log(msg) : (msg: string) => { }
console.log(`Response cache console logging set to ${appConfig.responseCache.consoleLogging}`)

export default class ResponseCacheProvider {
    static build(args?: ResponseCacheProviderArgs) {
        return async (req: any, res: any, next: any) => {
            if (req.method != 'GET') {
                next()
                return;
            }

            if (args.shouldCache && !args.shouldCache(req, res)) {
                next();
                return;
            }

            const accept = accepts(req)
            let method = accept.encoding(['gzip', 'deflate', 'identity'])

            // we really don't prefer deflate
            if (method === 'deflate' && accept.encoding(['gzip'])) {
                method = accept.encoding(['gzip', 'identity'])
            }

            // negotiation failed
            if (!method || method === 'identity') {
                next()
                consoleLog(`Caching NOT supported for ${ResponseCacheProvider.getUrl(req)} determined by the cache headers`)
                return
            }

            const compressionMethod = method === 'gzip' ? 'gzip' : 'deflate'
            const key = (args?.getKey != null ? args.getKey(req, res) : ResponseCacheProvider.getUrl(req)) + (compressionMethod == 'gzip' ? '-g' : '-d');

            if (appConfig.responseCache.consoleLogging) {
                consoleLog(`Cache key ${key}`)
            }

            const cachedBody = cacheRepository.get(key);
            const shouldCompress = args.compress == null || args.compress(req, res);

            if (shouldCompress) {
                res.header('Content-Encoding', compressionMethod)
            }

            if (args.contentType) {
                res.header('Content-Type', args.contentType(req, res))
            }

            if (cachedBody) {
                if (appConfig.responseCache.consoleLogging) {
                    consoleLog(`Cache key ${key} fetched from the cache`)
                }

                res.send(cachedBody)
                return
            } else {
                await locker.acquire(key, (): Promise<void> => {
                    const tryAgain = cacheRepository.get(key);
                    if (tryAgain) {
                        if (appConfig.responseCache.consoleLogging) {
                            consoleLog(`Cache key ${key} fetched from the cache`)
                        }

                        res.send(tryAgain)
                        return
                    }

                    return new Promise((resolve) => {
                        const tryAgain = cacheRepository.get(key)
                        if (tryAgain) {
                            res.send(tryAgain)
                            resolve()
                            return
                        }

                        res.sendResponse = res.send

                        if (shouldCompress) {
                            res.send = (body: any) => {
                                const buffer = args.bufferEncoding ? Buffer.from(body, args.bufferEncoding(req, res) as any) : Buffer.from(body)
                                zlib[compressionMethod](buffer, (err: any, compressedBuffer: any) => {
                                    if (err) {
                                        res.sendResponse(body)
                                        resolve()
                                        return
                                    }

                                    cacheRepository.set<any>(key, compressedBuffer, Math.round(args.timeToLiveMs / 1000))
                                    res.sendResponse(compressedBuffer)
                                    resolve()
                                })
                            }
                        } else {
                            res.send = (body: any) => {
                                cacheRepository.set<any>(key, body, Math.round(args.timeToLiveMs / 1000))
                                res.sendResponse(body);
                                resolve();
                            }
                        }

                        next()
                    })
                })
            }
        }
    }

    static getUrl(req: express.Request): string {
        return (req as any).originalUrl || req.url;
    }

    static purgeKeysBegginingWith(val: string | string[]) {
        if (!Array.isArray(val as any)) {
            val = [val as any];
        }

        const removeProps: string[] = [];
        for (const propName in (cacheRepository as any).data) {
            let valid = false;
            for (const key of (val as string[])) {
                if (propName.indexOf(key) == 0) {
                    valid = true;
                    break;
                }
            }

            if (valid) {
                removeProps.push(propName);
            }
        }

        for (const propName of removeProps) {
            cacheRepository.set(propName, null);
        }

    }

    static async purgeCache(): Promise<void> {
        cacheRepository.flushAll()
    }
}
