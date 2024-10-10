var storage = window["localStorage"];
delete (window as any)["localStorage"];
(window as any)["localStorage"] = {};

export class LocalStorageImpl {
    get length(): number {
        return storage.length;
    }

    clear(): void {
        storage.clear();
    }

    getItem(key: string): string | null {
        return storage.getItem("public." + key);
    }

    key(index: number): string | null {
        return storage.key(index);
    }

    removeItem(key: string): void {
        storage.removeItem("public." + key);
    }

    setItem(key: string, value: string): void {
        storage.setItem("public." + key, value);
    }
}

var newStorage = new LocalStorageImpl();
if (window["Proxy"] && window["Reflect"]) {
    newStorage = new window["Proxy"](newStorage, {
        get(target, prop: any) {
            if ((storage as any)[prop] != null) {
                return window["Reflect"].get(target, prop);
            } else {
                return storage.getItem("public." + prop);
            }
        },
        set(target, prop, value) {
            storage.setItem("public." + (prop as any), value);
            return true;
        },
    });
}

/**
 * Provides secure LocalStorage mechanism that is less vunerable to XSS
 */
export default class StorageProvider {
    /**
     * Obtains stored string
     * @param key Storage key
     * @param defaultValue Default value if no value is stored yet
     */
    static getString(key: string, defaultValue?: string): string {
        return storage.getItem("private." + key) || defaultValue;
    }

    /**
     * Obtains stored number
     * @param key Storage key
     * @param defaultValue Default value if no value is stored yet
     */
    static getNumber(key: string, defaultValue?: number): number {
        var retVal = StorageProvider.getString(key);
        var numVal: number;

        try {
            numVal = Number(retVal);
        } catch (e) {
            numVal = null;
        }

        if (numVal != null && !isNaN(numVal)) {
            return numVal;
        } else {
            return defaultValue;
        }
    }

    /**
     * Obtains stored object
     * @param key Storage key
     * @param defaultValue Default value if no value is stored yet
     */
    static getObject<T>(key: string, defaultValue?: T): T {
        var retVal = StorageProvider.getString(key);
        try {
            return JSON.parse(retVal);
        } catch (e) {
            return defaultValue;
        }
    }

    /**
     * Saves string into isolated local storage
     * @param key Storage key
     * @param value String to store
     */
    static setString(key: string, value: string): void {
        storage.setItem("private." + key, value);
    }

    /**
     * Saves number into isolated local storage
     * @param key Storage key
     * @param value Number to store
     */
    static setNumber(key: string, value: number): void {
        StorageProvider.setString(key, value as any);
    }

    /**
     * Saves object into isolated local storage
     * @param key Storage key
     * @param value Object to store
     */
    static setObject<T>(key: string, obj: T): void {
        var storeVal: string;
        try {
            storeVal = JSON.stringify(obj);
        } catch (e) {
            storeVal = null;
        }

        StorageProvider.setString(key, storeVal);
    }
}

(window as any)["localStorage"] = newStorage;
