import { toNative, Prop, Watch } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import FormItemWrapper, { FormItemWrapperArgs, MarginType } from "../form/form-item-wrapper";
import "bootstrap-datetime-picker";
import "../../../node_modules/bootstrap-datetime-picker/css/bootstrap-datetimepicker.min.css";
import DateInputHelper, { DateInputUsage } from "./ts/dateInputHelper";
import { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";

interface DatetimePickerArgs extends FormItemWrapperArgs {
    value: DateWrapper;
    placeholder?: string;
    showTime?: boolean;
    startDate?: DateWrapper;
    endDate?: DateWrapper;
    changed: (newValue: DateWrapper) => void;
    inline?: boolean;
}

@Component
class DatetimePicker extends TsxComponent<DatetimePickerArgs> implements DatetimePickerArgs {
    @Prop() label!: string;
    @Prop() labelButtons!: DropdownButtonItemArgs[];
    @Prop() subtitle!: string;
    @Prop() value!: DateWrapper;
    @Prop() placeholder!: string;
    @Prop() mandatory!: boolean;
    @Prop() wrap!: boolean;
    @Prop() hint: string;
    @Prop() appendIcon: string;
    @Prop() prependIcon: string;
    @Prop() appendClicked: () => void;
    @Prop() prependClicked: () => void;
    @Prop() maxWidth?: number;
    @Prop() marginType?: MarginType;
    @Prop() changed: (newValue: DateWrapper) => void;
    @Prop() showTime!: boolean;
    @Prop() startDate?: DateWrapper;
    @Prop() endDate?: DateWrapper;
    @Prop() inline!: boolean;

    currentValue: DateWrapper = this.value;

    raiseChangeEvent(newValue: DateWrapper) {
        this.populateValidationDeclaration();

        if (this.changed != null) {
            this.currentValue = newValue;
            this.changed(newValue);
        }
    }

    useNativeElement(): boolean {
        return DateInputHelper.useNativeElement(this.showTime);
    }

    getInputType(): string {
        if (this.useNativeElement()) {
            return DateInputHelper.getNativeInputType(this.showTime);
        } else {
            return "text";
        }
    }

    getInputValue(): string {
        if (this.currentValue == null) {
            return null;
        }

        if (this.useNativeElement()) {
            return this.currentValue.toWire(this.showTime);
        } else {
            return null;
        }
    }

    getLocale(): string {
        return DateInputHelper.getLocale();
    }

    getDtpDateFormat(): string {
        return DateInputHelper.getDtpDateFormat(this.showTime, DateInputUsage.DatetimePicker);
    }

    ensureLocale() {
        var locale = this.getLocale().substring(0, 2);
        if ($.fn["datetimepicker"].dates[locale] == null) {
            var resPack = {
                days: [],
                daysShort: [],
                daysMin: [],
                months: [],
                monthsShort: [],
                suffix: [],
                meridiem: [],
                today: "Today",
            };

            for (var i = 0; i < 12; i++) {
                var monthDate = new Date(Date.UTC(1990, i, 1));
                resPack.months.push(monthDate.toLocaleDateString(locale, { month: "long", timeZone: "UTC" }).capitalize());
                resPack.monthsShort.push(monthDate.toLocaleDateString(locale, { month: "short", timeZone: "UTC" }).capitalize());
            }

            for (var i = 7; i < 15; i++) {
                var dayDate = new Date(Date.UTC(2015, 5, i));
                resPack.days.push(dayDate.toLocaleDateString(locale, { weekday: "long", timeZone: "UTC" }).capitalize());

                var shortDay = dayDate.toLocaleDateString(locale, { weekday: "short", timeZone: "UTC" }).capitalize();
                resPack.daysShort.push(shortDay);

                if (shortDay.length > 2) {
                    shortDay = shortDay.substring(0, 2);
                }

                resPack.daysMin.push(shortDay);
            }

            $.fn["datetimepicker"].dates[locale] = resPack;
        }
    }

    getTimeZoneAbbreviation(): string {
        var abbreviation, date, formattedStr, matchedStrings, ref, str;
        date = new Date().toString();
        formattedStr = ((ref = date.split("(")[1]) != null ? ref.slice(0, -1) : 0) || date.split(" ");
        if (formattedStr instanceof Array) {
            matchedStrings = [];
            for (var i = 0, len = formattedStr.length; i < len; i++) {
                str = formattedStr[i];
                if ((abbreviation = (ref = str.match(/\b[A-Z]+\b/)) !== null) ? ref[0] : 0) {
                    matchedStrings.push(abbreviation);
                }
            }
            formattedStr = matchedStrings.pop();
        }
        return formattedStr;
    }

    handleInputValueChange(e) {
        if (this.useNativeElement()) {
            this.raiseChangeEvent(DateWrapper.fromWire(e.target.value));
        } else {
            this.getDtpJq()["datetimepicker"]("update");

            if (isNullOrEmpty(e.target.value)) {
                this.onDtpValueChanged(null);
            } else {
                var DPGlobal = $.fn["datetimepicker"].DPGlobal;
                var format = DPGlobal.parseFormat(this.getDtpDateFormat(), "standard");
                var parsedDate: Date = DPGlobal.parseDate(e.target.value, format, AppState.currentLanguageCode, "standard", "UTC");
                var utcDateWrapper = new DateWrapper(Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate(), parsedDate.getUTCHours(), parsedDate.getUTCMinutes()));
                this.onDtpValueChanged(utcDateWrapper as any);
            }
        }
    }

    handleInputOnFocus(e) {
        if (portalUtils.isChromeDesktopBrowser()) {
            ($(this.$el).find("input")[0] as any).showPicker();
        }
    }

    render(h) {
        var input;
        if (this.inline != true) {
            let value = this.getInputValue();
            let nativeElem = this.useNativeElement();
            let placeholderClass = nativeElem && !isNullOrEmpty(value) ? "" : " active-placeholder";

            input = (
                <input
                    type={this.getInputType()}
                    value={this.getInputValue()}
                    onChange={(e) => this.handleInputValueChange(e)}
                    onFocus={(e) => this.handleInputOnFocus(e)}
                    class={"form-control maxwidth-input dtp-input" + placeholderClass}
                    placeholder={this.placeholder}
                    min={this.startDate == null ? null : this.startDate.toWire(this.showTime)}
                    max={this.endDate == null ? null : this.endDate.toWire(this.showTime)}
                />
            );
        } else {
            input = <div class="dtp-input"></div>;
        }

        return (
            <FormItemWrapper
                label={this.label}
                mandatory={this.mandatory}
                wrap={this.wrap}
                appendIcon={this.appendIcon}
                prependIcon={this.prependIcon}
                hint={this.hint}
                appendClicked={this.appendClicked}
                prependClicked={this.prependClicked}
                marginType={this.marginType}
                maxWidth={this.maxWidth}
                validationState={this.validationState}
                labelButtons={this.labelButtons}
                subtitle={this.subtitle}
            >
                {input}
            </FormItemWrapper>
        );
    }

    onDtpValueChanged(e: Date): void {
        this.raiseChangeEvent(e != null ? DateWrapper.fromNonUtcDate(e) : null);
    }

    getDtpJq(): JQuery {
        return $(this.$el).find(".dtp-input") as any;
    }

    getDateForJqDtp(): Date {
        if (this.currentValue == null) {
            return null;
        }

        var d = this.currentValue;
        return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
    }

    refreshJqInputDate() {
        if (this.currentValue == null) {
            this.getDtpJq().val("");
            return;
        }

        var date = this.currentValue;
        var builder = [];
        var DPGlobal = $.fn["datetimepicker"].DPGlobal;
        var format = DPGlobal.parseFormat(this.getDtpDateFormat(), "standard");
        var separators = $.extend([], format.separators);
        var getVal = function (num: number): string {
            if (num < 10) {
                return "0" + num.toString();
            } else {
                return num.toString();
            }
        };

        if (date != null) {
            var funcMapping = {
                t: date.getTime(),
                yy: date.getFullYear().toString().substring(2),
                yyyy: date.getFullYear(),
                mm: getVal(date.getMonth() + 1),
                dd: getVal(date.getDate()),
                hh: getVal(date.getHours()),
                ii: getVal(date.getMinutes()),
                ss: getVal(date.getSeconds()),
                z: this.getTimeZoneAbbreviation(),
            };

            for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
                if (separators.length) {
                    builder.push(separators.shift());
                }

                builder.push(funcMapping[format.parts[i]]);
            }

            if (separators.length) {
                builder.push(separators.shift());
            }

            this.getDtpJq().val(builder.join(""));
        }
    }

    mounted() {
        this.currentValue = this.value;
        this.ensureLocale();

        if (!this.useNativeElement()) {
            this.getDtpJq()["datetimepicker"]({
                autoclose: true,
                formatType: "standard",
                keyboardNavigation: false,
                fontAwesome: true,
                format: this.getDtpDateFormat(),
                minView: this.showTime ? 0 : 2,
                initialDate: this.getDateForJqDtp(),
                startDate: this.startDate != null ? this.startDate.toWire(true) : null,
                endDate: this.endDate != null ? this.endDate.toWire(true) : null,
                language: AppState.currentLanguageCode,
                timezone: this.getTimeZoneAbbreviation(),
                weekStart: DateInputHelper.getStartOfWeek(),
            });

            this.getDtpJq()
                .on("changeDate", (e) => {
                    this.onDtpValueChanged(e["date"]);
                })
                .on("keydown", (e) => {
                    if (e.keyCode == 13) {
                        this.getDtpJq()["datetimepicker"]("hide");
                    }
                });

            this.refreshJqInputDate();
        }
    }

    @Watch("value")
    updateValue() {
        this.currentValue = this.value;
    }

    updated() {
        if (!this.useNativeElement()) {
            this.refreshJqInputDate();
            this.getDtpJq()["datetimepicker"]("update");
        }
    }

    beforeDestroy() {
        if (!this.useNativeElement()) {
            this.getDtpJq()["datetimepicker"]("remove");
        }
    }
}

export default toNative(DatetimePicker);
