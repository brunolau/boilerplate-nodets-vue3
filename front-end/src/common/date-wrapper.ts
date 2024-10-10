/**
 * Wrapper for Date class, works without timezones
 */
class DateWrapper {
    private _dte: Date = null;

    constructor(yearOrTime?: number, month?: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number) {
        if (month != null) {
            this._dte = new Date(Date.UTC(yearOrTime, month, date, hours || 0, minutes || 0, seconds || 0, ms || 0));
        } else if (yearOrTime != null) {
            this._dte = new Date(yearOrTime);
        } else {
            this._dte = new Date();
        }
    }

    serialize(): string {
        return this.toWire(true);
    }

    toJSON(key?: any): string {
        return this._dte.toJSON(key);
        //return this.serialize();
    }

    toString(): string {
        return this.toDisplayString();
    }

    toDisplayString(showTime?: boolean, showSeconds?: boolean, monthLong?: boolean): string {
        var args = {
            year: "numeric",
            month: monthLong ? "long" : "numeric",
            day: "numeric",
            timeZone: "UTC",
        } as any as Intl.DateTimeFormatOptions;

        if (showTime) {
            args.hour = "numeric";
            args.minute = "2-digit";
        }

        if (showSeconds) {
            args.second = "2-digit";
        }

        try {
            return this._dte.toLocaleDateString(AppState.currentLanguageCode, args);
        } catch (e) {
            return this._dte.toString();
        }
    }

    toDisplayStringNonUtc(showTime?: boolean, showSeconds?: boolean, monthLong?: boolean): string {
        var args = {
            year: "numeric",
            month: monthLong ? "long" : "numeric",
            day: "numeric",
        } as any as Intl.DateTimeFormatOptions;

        if (showTime) {
            args.hour = "numeric";
            args.minute = "2-digit";
        }

        if (showSeconds) {
            args.second = "2-digit";
        }

        try {
            return this._dte.toLocaleDateString(AppState.currentLanguageCode, args);
        } catch (e) {
            return this._dte.toString();
        }
    }

    getTime(): number {
        return this.innerDate.getTime();
    }

    getFullYear(): number {
        return this.innerDate.getUTCFullYear();
    }

    getMonth(): number {
        return this.innerDate.getUTCMonth();
    }

    getDate(): number {
        return this.innerDate.getUTCDate();
    }

    getDay(): number {
        return this.innerDate.getUTCDay();
    }

    getHours(): number {
        return this.innerDate.getUTCHours();
    }

    getMinutes(): number {
        return this.innerDate.getUTCMinutes();
    }

    getSeconds(): number {
        return this.innerDate.getSeconds();
    }

    getTimezoneOffset(): number {
        return this.innerDate.getTimezoneOffset();
    }

    static getCurrent(): DateWrapper {
        return DateWrapper.fromNonUtcDate(new Date());
    }

    setTime(time: number): number {
        return this.innerDate.setTime(time);
    }

    setSeconds(sec: number, ms?: number): number {
        return this.innerDate.setUTCSeconds(sec, ms);
    }

    setMinutes(min: number, sec?: number, ms?: number): number {
        return this.innerDate.setUTCMinutes(min, sec, ms);
    }

    setHours(hours: number, min?: number, sec?: number, ms?: number): number {
        return this.innerDate.setUTCHours(hours, min, sec, ms);
    }

    setDate(date: number): number {
        return this.innerDate.setUTCDate(date);
    }

    setMonth(month: number, date?: number): number {
        return this.innerDate.setUTCMonth(month, date);
    }

    setFullYear(year: number, month?: number, date?: number): number {
        return this.innerDate.setFullYear(year, month, date);
    }

    toISOString(): string {
        return this.toWire(true, true);
    }

    isDST(): boolean {
        var dstOffset = new Date(this.getFullYear(), 6, 1).getTimezoneOffset();
        if (dstOffset == this.innerDate.getTimezoneOffset()) {
            return true;
        } else {
            return false;
        }
    }

    get innerDate(): Date {
        return this._dte;
    }

    static isSerializedDate(str: string): boolean {
        return str != null && str.length > 18 && str.length < 29 && str.indexOf("T") == 10;
    }
    static deserialize(str: string): DateWrapper {
        return DateWrapper.fromWire(str);
    }

    static fromNonUtcDate(d: Date): DateWrapper {
        return new DateWrapper(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()));
    }

    static fromWire(value: string): DateWrapper {
        if (value != null && value.length > 0) {
            if (value.indexOf("T") > -1) {
                var year, month, day, hour, minute, second;
                var dtSplit = value.split("T");
                var dateSplit = dtSplit[0].split("-");
                var timeSplit = dtSplit[1].split(":");

                if (dateSplit.length == 3) {
                    year = Number(dateSplit[0]);
                    month = Number(dateSplit[1]) - 1;
                    day = Number(dateSplit[2]);

                    if (timeSplit.length > 1) {
                        hour = Number(timeSplit[0]);
                        minute = Number(timeSplit[1]);
                        second = timeSplit[2] || 0;

                        if (second != null && second != 0) {
                            try {
                                if (second.indexOf(".") > -1) {
                                    second = Number(second.split(".")[0]);
                                } else {
                                    second = Number(second);
                                }
                            } catch (e) {}
                        }

                        if (isNaN(second)) {
                            second = 0;
                        }

                        return new DateWrapper(year, month, day, hour, minute, second, 0);
                    }
                }
            } else {
                var splitVal = value.split("-");
                if (splitVal.length == 3) {
                    return new DateWrapper(Number(splitVal[0]), Number(splitVal[1]) - 1, Number(splitVal[2]), 0, 0, 0, 0);
                } else if (splitVal.length == 5) {
                    //TODO:
                }
            }
        }
        return null;
    }

    toWire(includeTime?: boolean, includeMs?: boolean): string {
        function formatDatePart(v: number) {
            if (v < 10) {
                return "0" + v.toString();
            } else {
                return v.toString();
            }
        }

        var datePart = this.getFullYear() + "-" + formatDatePart(this.getMonth() + 1) + "-" + formatDatePart(this.getDate());
        if (includeTime) {
            datePart += "T" + formatDatePart(this.getHours()) + ":" + formatDatePart(this.getMinutes()) + ":" + formatDatePart(this.getSeconds());
        }

        if (includeMs) {
            var ms = this.innerDate.getMilliseconds().toString();
            if (ms.length == 1) {
                ms = "00" + ms;
            } else if (ms.length == 2) {
                ms = "0" + ms;
            }

            datePart += "." + ms + "Z";
        }

        return datePart;
    }
}

window["DateWrapper"] = DateWrapper;
