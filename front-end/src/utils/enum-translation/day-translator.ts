import { DAY } from "../../api/data-contracts/enums";

export default class DayTranslator {
    private static _dayMap: { [index: string]: string } = null;

    static getString(day: DAY): string {
        this.initMap();
        return this._dayMap[day];
    }

    private static initMap() {
        if (this._dayMap != null) {
            return;
        }

        this._dayMap = {};
        const locale = AppState.currentLanguageCode;
        for (var i = 7; i < 15; i++) {
            const dayDate = new Date(Date.UTC(2015, 5, i));
            const dayName = dayDate.toLocaleDateString(locale, { weekday: "long", timeZone: "UTC" }).capitalize();
            const dayEnumName = dayDate.toLocaleDateString("en", { weekday: "long", timeZone: "UTC" }).toUpperCase();
            this._dayMap[dayEnumName] = dayName;
        }
    }
}
