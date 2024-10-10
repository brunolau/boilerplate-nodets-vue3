class QueryStringUtils {
    static getBool(paramName: string, defaultValue?: boolean): boolean {
        return this._parseQsBool(this._getQsValueCaseInsensitive(paramName), defaultValue);
    }

    static getString(paramName: string, defaultValue?: string): string {
        return this._getQsValueCaseInsensitive(paramName) || defaultValue;
    }

    static getNumber(paramName: string, defaultValue?: number): number {
        var val = this._getQsValueCaseInsensitive(paramName);
        if (val && portalUtils.isNumber(val)) {
            return Number(val);
        } else {
            return defaultValue;
        }
    }

    private static _getQsValueCaseInsensitive(paramName: string): string {
        paramName = paramName.toLowerCase();
        var route = AppState.router.currentRoute;

        if (route != null && route.value.query != null) {
            for (var key in route.value.query) {
                if (key.toLowerCase() == paramName) {
                    return route.value.query[key] as any;
                }
            }
        }

        var qs = location.search;
        if (qs != null && qs.length > 0) {
            var splitArr = qs.substring(1).split("&");
            for (var i = 0, len = splitArr.length; i < len; i++) {
                var pair = splitArr[i];
                if (pair.toLowerCase().indexOf(paramName + "=") == 0) {
                    return decodeURIComponent(pair.substring(paramName.length + 1));
                }
            }
        }

        return null;
    }

    private static _parseQsBool(qsArg: string, defaultValue?: boolean): boolean {
        if (qsArg == null || qsArg.length == 0) {
            if (defaultValue != null) {
                return defaultValue;
            } else {
                return false;
            }
        }

        qsArg = qsArg.toLowerCase().trim();
        return qsArg == "1" || qsArg == "yes" || qsArg == "true";
    }
}

window["QueryStringUtils"] = QueryStringUtils;
