interface IRowWithTimezone {
    TimezoneGmtOffset?: number;
    TimezoneDstOffset?: number;
}

export default class TimezoneHelper {
    public static isDST(targetDate: DateWrapper): boolean {
        var currMonth = targetDate.getMonth() + 1;
        if (currMonth < 3) {
            return false;
        } else if (currMonth > 3 && currMonth < 10) {
            return true;
        } else if (currMonth == 3) {
            if (targetDate.getDate() >= this.getLastSunday(targetDate.getMonth() + 1, targetDate.getFullYear()).getDate()) {
                return true;
            } else {
                return false;
            }
        } else if (currMonth == 10) {
            if (targetDate.getDate() >= this.getLastSunday(targetDate.getMonth() + 1, targetDate.getFullYear()).getDate()) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    public static getLocalDateFromUTC(dateUTC: DateWrapper, dataRow: IRowWithTimezone): DateWrapper;
    public static getLocalDateFromUTC(dateUTC: DateWrapper, dstOffset: number, gmtOffset: number): DateWrapper;
    public static getLocalDateFromUTC(dateUTC: DateWrapper, dstOffsetOrRow: number | IRowWithTimezone, gmtOffset?: number): DateWrapper {
        if (dateUTC == null) return null;

        let tzRow = this.getRowWithTimezone(dstOffsetOrRow, gmtOffset);
        return new DateWrapper(dateUTC.getTime() + (this.isDST(dateUTC) ? tzRow.TimezoneDstOffset : tzRow.TimezoneGmtOffset) * -1 * 60 * 1000);
    }

    public static getUTCFromLocalDate(dateUTC: DateWrapper, dataRow: IRowWithTimezone): DateWrapper;
    public static getUTCFromLocalDate(dateUTC: DateWrapper, dstOffset: number, gmtOffset: number): DateWrapper;
    public static getUTCFromLocalDate(dateUTC: DateWrapper, dstOffsetOrRow: number | IRowWithTimezone, gmtOffset?: number): DateWrapper {
        if (dateUTC == null) return null;

        let tzRow = this.getRowWithTimezone(dstOffsetOrRow, gmtOffset);
        return new DateWrapper(dateUTC.getTime() + (this.isDST(dateUTC) ? tzRow.TimezoneDstOffset : tzRow.TimezoneGmtOffset) * 60 * 1000);
    }

    private static getRowWithTimezone(dstOffsetOrRow: number | IRowWithTimezone, gmtOffset?: number): IRowWithTimezone {
        let tzRow = dstOffsetOrRow as IRowWithTimezone;
        if (tzRow.TimezoneDstOffset != null) {
            return tzRow;
        }

        return {
            TimezoneDstOffset: dstOffsetOrRow as number,
            TimezoneGmtOffset: gmtOffset,
        };
    }

    private static getLastSunday(month, year): Date {
        var d = new Date();
        if (year) {
            d.setFullYear(year);
        }
        d.setDate(1); // Roll to the first day of ...
        d.setMonth(month || d.getMonth() + 1); // ... the next month.
        do {
            // Roll the days backwards until Sunday.
            d.setDate(d.getDate() - 1);
        } while (d.getDay() !== 0);
        return d;
    }
}
