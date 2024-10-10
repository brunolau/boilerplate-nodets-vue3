export type ReadonlyClass<T extends new (...args: any) => any> =
    T extends new (...args: infer A) => infer R ?
    new (...args: A) => { readonly [K in keyof R]: R[K] } : never;

const getAppPort = () => {
    return process.env.APP_PORT ? Number(process.env.APP_PORT) : 5492
}

const parseNum = (val: string, defaultValue?: number): number => {
    if (val == null) {
        return defaultValue;
    }

    try {
        const num = Number(val);
        if (isNaN(num)) {
            return defaultValue
        }

        return num;
    } catch (error) {
        return defaultValue;
    }
}

class ConfigImpl {
    mode: 'development' | 'production' = process.env.NODE_ENV as any
    server = {
        /** Port on which the app listens */
        port: getAppPort(),
        devFrontend: process.env.DEV_FRONTEND || 'http://localhost:9924',
        domain: process.env.DOMAIN || `http://localhost:${getAppPort()}`,
        cdnUrl: process.env.CDN_URL || process.env.DOMAIN || `http://localhost:${getAppPort()}`
    }
    database = {
        traceTimeEnabled: process.env.DB_TRACE_TIME == 'true',
        logQuery: process.env.DB_LOG_QUERY == 'true'
    }
    workflow = {

    }
    logging = {
        dumpErrorResponses: process.env.LOG_DUMP_500_ERRORS == 'true',
		logErrorFull: process.env.LOG_ERROR_FULL == 'true',
    }
    rateLimit = {
        enabled: true,
        windowMs: 30000,
        throughPut: 50
    }
    responseCache = {
        cacheStaticFiles: process.env.CACHE_STATIC_FILES != 'false',
        consoleLogging: process.env.CACHE_CONSOLE_LOG == 'true'
    }
    thirdParty = {

    }
    cache = {
        timeToLiveMs: 30000,
        useLocking: true,
        maxLockerQueue: 50000
    }
}

export const ConfingReadonly: ReadonlyClass<typeof ConfigImpl> = ConfigImpl;
const appConfig = new ConfingReadonly();

export default appConfig;
