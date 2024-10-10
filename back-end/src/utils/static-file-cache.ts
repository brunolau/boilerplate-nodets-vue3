import express from "express"
import mime from 'mime-types'
import path from 'path'
import fs from 'fs'
import appConfig from "src/config/appConfig"
import ResponseCacheProvider from "./response-cache-compressed"
import { ExpressRequest, ExpressResponse } from "./express-utils"

export const bindStaticFiles = (app: any, bindingPath: string | string[], resolvePath: string) => {
    if (appConfig.responseCache.cacheStaticFiles) {
        const _bindExt = (req: ExpressRequest): string => {
            (req as any)._fileExt = (ResponseCacheProvider.getUrl(req) || '').split('.').pop().split('?')[0].toLowerCase();
            return (req as any)._fileExt
        }

        const getExt = (req: ExpressRequest): string => {
            return (req as any)._fileExt || _bindExt(req);
        }

        const shouldCompress = (req: ExpressRequest): boolean => {
            const ext = getExt(req);
            return ext == 'js' || ext == 'css';
        }

        const shouldCache = (req: ExpressRequest): boolean => {
            const ext = getExt(req);
            return ext == 'js' || ext == 'css' || ext == 'woff2' ||  ext == 'woff';
        }

        app.use(bindingPath, ResponseCacheProvider.build({
            timeToLiveMs: 60000,
            shouldCache: (req, res) => {
                return shouldCache(req);
            },
            compress: (req, res) => {
                return shouldCompress(req);
            },
            contentType: (req, res) => {
                const ext = getExt(req);
                if (ext.indexOf('js') == 0) {
                    return 'application/javascript; charset=utf-8';
                } else if (ext.indexOf('css') == 0) {
                    return 'text/css; charset=utf-8';
                } else {
                    return mime.lookup(ext) as any;
                }
            },
        }), (req: ExpressRequest, res: ExpressResponse, next: any) => {
            if (!shouldCache(req)) {
                return next();
            }

            try {
                const filePath = path.join(resolvePath, (req.path || '').split('?')[0])
                fs.readFile(filePath, (err, data) => {
                    if (err) {
                        return next()
                    }
    
                    res.send(data)
                })    
            } catch (error) {
                return next();
            }
        }, express.static(resolvePath))
    } else {
        app.use(bindingPath, express.static(resolvePath))
    }
}