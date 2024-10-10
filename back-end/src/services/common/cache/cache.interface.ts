interface CacheProviderSetArgs {
    timeToLiveMs: number
    setIfNull?: boolean
}

export interface ICache {
    getWithLock<T>(key: string, obtainDataFunc: () => Promise<T>, setArgs?: CacheProviderSetArgs): Promise<T>
    getAllKeys(): Promise<string[]>
    remove(key: string): Promise<void>
    purgeCache(): Promise<void>;
}