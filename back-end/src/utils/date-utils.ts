import { DAY_MS, HOUR_MS, MINUTE_MS, MONTH_MS, SECOND_MS, YEAR_MS } from "./constants";

export enum TimeUnit {
	YEARS,
	MONTHS,
	DAYS,
	HOURS,
	MINUTES,
	SECONDS
}

export default class DateUtils {
	/**
	 * Returns the date in the provided format
	 * @param date Date to format
	 * @param format Format to use (eg. YYYY-MM-DD)
	 * @returns The date in the provided format
	 */
	static getFormat(date: Date, format: string): string {
		if (date == null || format == null || format.length === 0) {
			return '';
		}

		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();

		const hour = date.getHours();
		const minute = date.getMinutes();
		const second = date.getSeconds();

		return format.replace('YYYY', year.toString())
			.replace('MM', month.toString().padStart(2, '0'))
			.replace('DD', day.toString().padStart(2, '0'))
			.replace('HH', hour.toString().padStart(2, '0'))
			.replace('mm', minute.toString().padStart(2, '0'))
			.replace('ss', second.toString().padStart(2, '0'))
			.replace('M', month.toString())
			.replace('D', day.toString())
			.replace('H', hour.toString())
			.replace('m', minute.toString())
			.replace('s', second.toString());
	}

	/**
	 * Compares two dates, ignoring the time
	 * @param date1 First date to compare
	 * @param date2 Second date to compare
	 * @param compareFn Function used to compare the dates. Parameters are dates with removed time in milliseconds
	 * @returns True if the condtion from compareFn is met, false otherwise
	 */
	static compareDatesOnly(date1: Date, date2: Date, compareFn: (date1Time: number, date2Time: number) => boolean): boolean {
		const date1Obj = new Date(date1);
		const date2Obj = new Date(date2);
		const onlyDate1 = new Date(date1Obj.getFullYear(), date1Obj.getMonth(), date1Obj.getDate());
		const onlyDate2 = new Date(date2Obj.getFullYear(), date2Obj.getMonth(), date2Obj.getDate());

		return compareFn(onlyDate1.getTime(), onlyDate2.getTime());
	}

	/**
	 * Checks whether the date is between the provided dates
	 * @param date Date to check
	 * @param dateFrom Start date
	 * @param dateTo End date
	 * @returns True if the date is between the provided dates, false otherwise
	 */
	static isBetweenDates(date: Date, dateFrom: Date, dateTo: Date): boolean {
		if (date == null || dateFrom == null || dateTo == null) {
			return false;
		}

		if (!this.isValidDate(date) || !this.isValidDate(dateFrom) || !this.isValidDate(dateTo)) {
			return false;
		}

		const deserializedDateFrom = new Date(dateFrom);
		const deserializedDateTo = new Date(dateTo);
		const deserializedDate = new Date(date);

		return DateUtils.compareDatesOnly(deserializedDate, deserializedDateFrom, (deserializedDate, deserializedDateFrom) => deserializedDate >= deserializedDateFrom) && DateUtils.compareDatesOnly(deserializedDate, deserializedDateTo, (deserializedDate, deserializedDateTo) => deserializedDate <= deserializedDateTo);
	}

	/**
	 * Checks whether provided dates are overlapping
	 * @param dateFrom1
	 * @param dateTo1
	 * @param dateFrom2
	 * @param dateTo2
	 * @returns True if the dates are overlapping, false otherwise
	 */
	static isOverlapping(dateFrom1: Date, dateTo1: Date, dateFrom2: Date, dateTo2: Date): boolean {
		if (!this.isValidDate(dateFrom1) || !this.isValidDate(dateTo1) || !this.isValidDate(dateFrom2) || !this.isValidDate(dateTo2)) {
			return false;
		}

		const start1 = new Date(dateFrom1).getTime();
		const end1 = new Date(dateTo1).getTime();
		const start2 = new Date(dateFrom2).getTime();
		const end2 = new Date(dateTo2).getTime();

		return start1 <= end2 && start2 <= end1;
	}

	/**
     * Returns the difference between two dates in the specified unit of time
     * @param from First date
     * @param to Second date
     * @param unit Unit of time
     * @returns The difference between two dates in the specified unit of time
     */
    static getDifference(from: Date, to: Date, unit: TimeUnit): number {
        if (from == null || to == null) {
            return null;
        }

		const dateFrom = new Date(from);
		const dateTo = new Date(to);

        const timeDiff = Math.abs(dateTo.getTime() - dateFrom.getTime());
        let diff = null;

        switch (unit) {
			case TimeUnit.YEARS:
				diff = timeDiff / YEAR_MS;
				break;
			case TimeUnit.MONTHS:
				diff = timeDiff / MONTH_MS;
				break;
            case TimeUnit.DAYS:
                diff = timeDiff / DAY_MS;
                break;
            case TimeUnit.HOURS:
                diff = timeDiff / HOUR_MS;
                break;
            case TimeUnit.MINUTES:
                diff = timeDiff / MINUTE_MS;
                break;
			case TimeUnit.SECONDS:
				diff = timeDiff / SECOND_MS;
				break;
            default:
                throw "Invalid time unit specified"
        }

        return Math.floor(diff);
    }

	/**
	 * Check whether the date is valid
	 * @param date Date to check
	 * @returns True if the date is valid, false otherwise
	 */
	static isValidDate(date: Date | string): boolean {
		if (date == null) {
			return false;
		}

		const dateObj = typeof date === 'string' ? new Date(date) : date;
		return dateObj instanceof Date && !isNaN(dateObj.getTime());
	}

	/**
	 * Adds the specified years to the date
	 * @param date Date to add years to
	 * @param years Years to add
	 * @returns The date with the added years
	 */
	static addYears(date: Date, years: number): Date {
		if (!this.isValidDate(date)) {
			return null;
		}

		const tempDate = new Date(date);
		tempDate.setFullYear(tempDate.getFullYear() + years);

		return tempDate;
	}

	/**
	 * Adds the specified months to the date
	 * @param date Date to add months to
	 * @param months Months to add
	 * @returns The date with the added months
	 */
	static addMonths(date: Date, months: number): Date {
		if (!this.isValidDate(date)) {
			return null;
		}

		const tempDate = new Date(date);
		tempDate.setMonth(tempDate.getMonth() + months);

		return tempDate;
	}

	/**
	 * Adds the specified days to the date
	 * @param date Date to add days to
	 * @param days Days to add
	 * @returns The date with the added days
	 */
	static addDays(date: string | Date, days: number): Date {
		if (!this.isValidDate(date)) {
			return null;
		}

		const tempDate = new Date(date);
		tempDate.setDate(tempDate.getDate() + days);

		return tempDate;
	}

	/**
	 * Adds the specified hours to the date
	 * @param date Date to add hours to
	 * @param hours Hours to add
	 * @returns The date with the added hours
	 */
	static addHours(date: Date, hours: number): Date {
		if (!this.isValidDate(date) || !(hours > 0)) {
			return null;
		}

		const tempDate = new Date(date);
		tempDate.setHours(tempDate.getHours() + hours);

		return tempDate;
	}

	/**
	 * Adds the specified minutes to the date
	 * @param date Date to add minutes to
	 * @param minutes Minutes to add
	 * @returns The date with the added minutes
	 */
	static addMinutes(date: Date, minutes: number): Date {
		if (!this.isValidDate(date) || !(minutes > 0)) {
			return null;
		}

		const tempDate = new Date(date);
		tempDate.setMinutes(tempDate.getMinutes() + minutes);

		return tempDate;
	}

	/**
	 * Checks whether provided dates are equal based on the specified precision
	 * @param date1 First date
	 * @param date2 Second date
	 * @param precision Precision to use
	 * @returns State of the equality
	 */
	static equals(date1: Date, date2: Date, precision: TimeUnit): boolean {
		if (!this.isValidDate(date1) || !this.isValidDate(date2)) {
			return false;
		}

		const parsedDate1 = new Date(date1);
		const parsedDate2 = new Date(date2);

		const yearEqual = parsedDate1.getFullYear() === parsedDate2.getFullYear();
		const monthEqual = parsedDate1.getMonth() === parsedDate2.getMonth();
		const dayEqual = parsedDate1.getDate() === parsedDate2.getDate();
		const hoursEqual = parsedDate1.getHours() === parsedDate2.getHours();
		const minutesEqual = parsedDate1.getMinutes() === parsedDate2.getMinutes();
		const secondsEqual = parsedDate1.getSeconds() === parsedDate2.getSeconds();

		switch (precision) {
			case TimeUnit.YEARS:
				return yearEqual;
			case TimeUnit.MONTHS:
				return yearEqual && monthEqual;
			case TimeUnit.DAYS:
				return yearEqual && monthEqual && dayEqual;
			case TimeUnit.HOURS:
				return yearEqual && monthEqual && dayEqual && hoursEqual;
			case TimeUnit.MINUTES:
				return yearEqual && monthEqual && dayEqual && hoursEqual && minutesEqual;
			case TimeUnit.SECONDS:
				return yearEqual && monthEqual && dayEqual && hoursEqual && minutesEqual && secondsEqual;
			default:
				throw 'Invalid precision specified';
		}
	}

	/**
	 * Get the date range between two dates
	 * @param dateFrom Start date
	 * @param dateTo End date
	 * @returns The date range between the two dates (inclusive)
	 */
	static getRange(dateFrom: Date, dateTo: Date): Date[] {
		if (!this.isValidDate(dateFrom) || !this.isValidDate(dateTo)) {
			return [];
		}

		const range: Date[] = [];
		const tempDate = new Date(dateFrom);

		while (tempDate <= new Date(dateTo)) {
			range.push(new Date(tempDate));
			tempDate.setDate(tempDate.getDate() + 1);
		}

		return range;
	}

	/**
	 * Get number of days in the month by the provided date
	 * @param date
	 * @returns Number of days in the month
	 */
	static getMonthDays(date: Date): number {
		if (!this.isValidDate(date)) {
			return null;
		}

		const tempDate = new Date(date);
		const month = tempDate.getMonth();
		const year = tempDate.getFullYear();
		const days = this.getDaysByMonth(month, year);

		return days;
	}

	/**
	 * Get number of days in the month
	 * @param month Index of the month to get number of days for
	 * @param year Year to get number of days for (default is current year)
	 * @returns Number of days in the month
	 */
	static getDaysByMonth(month: number, year: number = new Date().getFullYear()): number {
		const days = new Date(year, month + 1, 0).getDate();
		return days;
	}

	/**
	 * Extract specific data from the date
	 * @param date Date to process
	 * @returns
	 */
	static extractData(date: Date): { year: number, month: number, day: number, hour: number, minute: number, second: number } {
		if (!this.isValidDate(date)) {
			return null;
		}

		const tempDate = new Date(date);
		return {
			year: tempDate.getFullYear(),
			month: tempDate.getMonth() + 1,
			day: tempDate.getDate(),
			hour: tempDate.getHours(),
			minute: tempDate.getMinutes(),
			second: tempDate.getSeconds()
		};
	}

	static getFirstDayOfMonth(date: Date): Date {
		if (!this.isValidDate(date)) {
			return null;
		}

		const tempDate = new Date(date);
		tempDate.setDate(1);

		return tempDate;
	}

	static getLastDayOfMonth(date: Date): Date {
		if (!this.isValidDate(date)) {
			return null;
		}

		const tempDate = new Date(date);
		tempDate.setMonth(tempDate.getMonth() + 1);
		tempDate.setDate(0);

		return tempDate;
	}
}
