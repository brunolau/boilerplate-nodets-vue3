export default class JsonColumnUtils {
    static ensureSubtype<T>(value: T, classType: new () => T): T {
        if (value == null) {
            return new classType();
        }

        const instance = new classType();
        for (const propName in value) {
            instance[propName] = value[propName];
        }

        return instance;
    }
}
