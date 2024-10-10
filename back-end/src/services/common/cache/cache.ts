import NodeCache from 'node-cache';
import AsyncLock from 'async-lock';
import appConfig from 'src/config/appConfig';
import { injectable } from "inversify";
import { ICache } from './cache.interface';

const cacheConfig = appConfig.cache;
const cacheRepository = new NodeCache({ checkperiod: Math.round(cacheConfig.timeToLiveMs / 1000) });
const locker = new AsyncLock({ maxPending: cacheConfig.maxLockerQueue });
const useLocker = cacheConfig.useLocking != false;

interface CacheProviderSetArgs {
    timeToLiveMs: number
    setIfNull?: boolean
}


@injectable()
export default class CacheProvider implements ICache {
    async getWithLock<T>(key: string, obtainDataFunc: () => Promise<T>, setArgs?: CacheProviderSetArgs): Promise<T> {
        const resp = await this.get<T>(key);
        if (resp != null) {
            return resp;
        }

        if (useLocker) {
            try {
                await locker.acquire('che-' + key, async () => {
                    const resp = await this.get<T>(key);
                    if (resp == null) {
                        try {
                            await this.performCacheSet(key, obtainDataFunc, setArgs);
                        } catch (error) {
                            console.error(error);
                        }
                    }
                });
            } catch (error) {
                console.error(error);
                await this.performCacheSet(key, obtainDataFunc, setArgs);
            }
        } else {
            await this.performCacheSet(key, obtainDataFunc, setArgs);
        }

        return await this.get(key);
    }

    async remove(key: string): Promise<void> {
        cacheRepository.del(key);
    }

    async purgeCache(): Promise<void> {
        cacheRepository.flushAll();
    }

    async get<T>(key: string): Promise<T> {
        return cacheRepository.get(key);
    }

    async getAllKeys(): Promise<string[]> {
        return cacheRepository.keys();
    }

    async set<T>(key: string, value: T, options?: CacheProviderSetArgs): Promise<void> {
        value = JSON.parse(JSON.stringify(value));

        if (options?.timeToLiveMs > 0) {
            cacheRepository.set(key, value, Math.round(options.timeToLiveMs / 1000));
        } else {
            cacheRepository.set(key, value);
        }
    }

    async performCacheSet<T>(key: string, obtainDataFunc: () => Promise<T>, setArgs?: CacheProviderSetArgs) {
        const existing = await this.get<T>(key);
        if (existing != null) {
            return;
        }

        const data = await obtainDataFunc();
        if (data == null && setArgs?.setIfNull == false) {
            return;
        }

        await this.set(key, data, setArgs);
    }
}