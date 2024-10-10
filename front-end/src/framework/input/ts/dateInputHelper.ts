export const enum DateInputUsage {
    DatetimePicker = 0,
    DaterangePicker = 1,
}

export default class DateInputHelper {
    static useNativeElement(showTime: boolean): boolean {
        return (
            DateInputHelper.nativeSupported(showTime) &&
            (portalUtils.isTouchDevice() || window["cordova"] != null || portalUtils.isChromeDesktopBrowser() || navigator.userAgent.toLowerCase().indexOf("firefox") > -1)
        );
    }

    static getLocale(): string {
        var locale = AppState.currentLanguageCode;
        if (locale == "en") {
            var navigatorLang = navigator.language || navigator["userLanguage"];
            if (navigatorLang != null && navigatorLang.indexOf("en-") == 0) {
                return navigatorLang;
            }
        }

        return locale;
    }

    static nativeSupported(showTime: boolean): boolean {
        var inputType = this.getNativeInputType(showTime);
        var cacheKey = inputType + "-supported";
        var cachedValue = this.getValueFromCache(cacheKey);

        if (cachedValue != null) {
            return cachedValue;
        }

        var el = document.createElement("input");
        var notADateValue = "not-a-date";
        el.setAttribute("type", inputType);
        el.setAttribute("value", notADateValue);

        var retVal = !(el.value === notADateValue);
        this.cacheValue(cacheKey, retVal);
        return retVal;
    }

    static getNativeInputType(showTime: boolean): string {
        return showTime ? "datetime-local" : "date";
    }

    static getDtpDateFormat(showTime: boolean, usage: DateInputUsage): string {
        var locale = this.getLocale();
        var cacheKey = "format-" + locale + "-" + (showTime == true).toString() + "-" + usage.toString();
        var cachedValue = this.getValueFromCache(cacheKey);

        if (cachedValue != null) {
            return cachedValue;
        }

        var date = new Date(Date.UTC(1990, 9, 11, 12, 20, 30));
        var options: any = {
            year: "numeric",
            month: "2-digit",
            day: "numeric",
            timeZone: "UTC",
        };

        if (showTime) {
            options.hour = "2-digit";
            options.minute = "2-digit";
            //options.second = '2-digit';
        }

        var retVal = date
            .toLocaleDateString(locale, options)
            .split(". ")
            .join(".")
            .split(",")
            .join(" ")
            .split("1990")
            .join("yyyy")
            .split("10")
            .join("mm")
            .split("11")
            .join("dd")
            .split("12")
            .join("hh")
            .split("20")
            .join("ii")
            .split("30")
            .join("ss")
            .split("AM")
            .join("")
            .split("PM")
            .join("")
            .split("yyyyhh")
            .join("yyyy hh");

        this.cacheValue(cacheKey, retVal);
        return retVal;
    }

    static getStartOfWeek(): number {
        return 1;
    }

    private static getValueFromCache(key: string): any {
        if (window["_DateTimePickerCache"] == null) {
            window["_DateTimePickerCache"] = {};
        }

        return window["_DateTimePickerCache"][key];
    }

    private static cacheValue(key: string, value: any): void {
        if (window["_DateTimePickerCache"] == null) {
            window["_DateTimePickerCache"] = {};
        }

        return (window["_DateTimePickerCache"][key] = value);
    }
}
