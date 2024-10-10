import { toNative, Prop, Watch } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { FormItemWrapperArgs, MarginType } from "../form/form-item-wrapper";
import TextBox from "./textbox";
import moment from "moment";
import "./../../../node_modules/jquery-date-range-picker/dist/jquery.daterangepicker.min.js";
import "./../../../node_modules/jquery-date-range-picker/dist/daterangepicker.min.css";
import "./css/daterange-picker.css";
import DateInputHelper from "./ts/dateInputHelper";
import { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";

interface DaterangePickerArgs extends FormItemWrapperArgs {
    value?: DaterangeChangedArgs;
    placeholder?: string;
    changed?: (newValue: DaterangeChangedArgs) => void;
}

export interface DaterangeChangedArgs {
    startTime: DateWrapper;
    endTime: DateWrapper;
}

@Component
class DaterangePicker extends TsxComponent<DaterangePickerArgs> implements DaterangePickerArgs {
    @Prop() label!: string;
    @Prop() labelButtons!: DropdownButtonItemArgs[];
    @Prop() cssClass!: string;
    @Prop() subtitle!: string;
    @Prop() value!: DaterangeChangedArgs;
    @Prop() placeholder!: string;
    @Prop() mandatory!: boolean;
    @Prop() wrap!: boolean;
    @Prop() hint: string;
    @Prop() appendIcon: string;
    @Prop() prependIcon: string;
    @Prop() appendClicked: () => void;
    @Prop() prependClicked: () => void;
    @Prop() marginType?: MarginType;
    @Prop() changed: (newValue: DaterangeChangedArgs) => void;

    _startDate: Date;
    _endDate: Date;
    _changed: boolean;
    _lastText: string;
    currentValue: DaterangeChangedArgs = this.value;

    raiseChangedEvent() {
        if (this._changed && this.changed != null) {
            this._lastText = $(this.$el).find("input").val() as any; //TODO: Implement

            this.changed({
                startTime: DateWrapper.fromNonUtcDate(this._startDate),
                endTime: DateWrapper.fromNonUtcDate(this._endDate),
            });
        }
    }

    mounted() {
        this.currentValue = this.value;
        var self = this;
        var $elem = this.getInputElement();

        if (AppState.currentLanguage == Language.Slovak) {
            this.ensureSlovakResources();
        }

        $elem["dateRangePicker"]({
            startOfWeek: DateInputHelper.getStartOfWeek() == 0 ? "sunday" : "monday",
            separator: " ~ ",
            format: this.getFormat(),
            language: self.getLanguage(),
            autoClose: false,
            time: {
                enabled: true,
            },
            setValue: function (this: any, dateRange, dateStart, dateEnd) {
                if (!$(this).attr("readonly") && !$(this).is(":disabled") && dateRange != $(this).val()) {
                    $(this).val(dateRange);
                }

                self.syncInputWithValues.call(self, dateRange);
            },
            defaultTime: moment().startOf("day").toDate(),
            defaultEndTime: moment().endOf("day").toDate(),
        })
            .bind("datepicker-open", function () {
                self._changed = false;
            })
            .bind("datepicker-change", function (event, obj) {
                self._startDate = obj.date1;
                self._endDate = obj.date2;
                self._changed = true;
            })
            .bind("datepicker-closed", function () {
                var val = $elem.val() as string;
                if (isNullOrEmpty(val)) {
                    if (self._startDate != null) {
                        self._startDate = null;
                        self._changed = true;
                    }

                    if (self._endDate != null) {
                        self._endDate = null;
                        self._changed = true;
                    }
                }

                self.raiseChangedEvent();
            });
    }

    @Watch("value")
    updateValue() {
        this.currentValue = this.value;
    }

    getIsSingleDate(): boolean {
        return false;
    }

    getInputElement(): JQuery {
        return $(this.$el).find("input") as any;
    }

    getRangeText(e: DaterangeChangedArgs) {
        return this._lastText;

        if (e == null) {
            return null;
        }
    }

    getLanguage(): string {
        var lang = DateInputHelper.getLocale();
        if (lang == "cs") {
            lang = "cz";
        }

        return lang;
    }

    getFormat(): string {
        return "DD.MM.YYYY HH:mm";
    }

    getSeparator(): string {
        return " ~ ";
    }

    getDateFromString(dateStr: string): Date {
        let locale = moment.locale(this.getLanguage());
        if (moment(dateStr, this.getFormat(), locale).isValid()) {
            return moment(dateStr, this.getFormat(), locale).toDate();
        } else {
            return moment().toDate();
        }
    }

    syncInputWithValues(dateRange?: string, dateStart?: string, dateEnd?: string) {
        if (isNullOrEmpty(dateStart) || isNullOrEmpty(dateEnd)) {
            var __default_string: string = dateRange || (this.getInputElement().val() as string);
            var defaults = __default_string ? __default_string.split(this.getSeparator()) : [];

            if (defaults && ((defaults.length == 1 && this.getIsSingleDate()) || defaults.length >= 2)) {
                var ___format = this.getFormat();
                if (___format.match(/Do/)) {
                    ___format = ___format.replace(/Do/, "D");
                    defaults[0] = defaults[0].replace(/(\d+)(th|nd|st)/, "$1");
                    if (defaults.length >= 2) {
                        defaults[1] = defaults[1].replace(/(\d+)(th|nd|st)/, "$1");
                    }
                }

                dateStart = defaults[0];
                dateEnd = defaults[1];
            }
        }

        let startDate = this.getDateFromString(dateStart);
        if (startDate != this._startDate) {
            this._startDate = startDate;
            this._changed = true;
        }

        let endDate = this.getDateFromString(dateEnd);
        if (endDate != this._endDate) {
            this._endDate = endDate;
            this._changed = true;
        }
    }

    ensureSlovakResources() {
        var resourcePack = ($ as any).dateRangePickerLanguages;
        if (resourcePack.sk == null) {
            resourcePack.sk = {
                selected: "Vybrané:",
                day: "Deň",
                days: "Dni",
                apply: "Zavrieť",
                "week-1": "po",
                "week-2": "út",
                "week-3": "st",
                "week-4": "št",
                "week-5": "pi",
                "week-6": "so",
                "week-7": "ne",
                "week-number": "T",
                "month-name": ["január", "február", "marec", "apríl", "máj", "jún", "júl", "august", "september", "október", "november", "december"],
                shortcuts: "Skratky",
                "custom-values": "Vlastné hodnoty",
                past: "po",
                following: "nasledujúci",
                previous: "predchádzajúci",
                "prev-week": "týždeň",
                "prev-month": "mesiac",
                "prev-year": "rok",
                next: "ďalší",
                "next-week": "týždeň",
                "next-month": "mesiac",
                "next-year": "rok",
                "less-than": "Rozsah dátumu by nemal byť väčší ako %d dní",
                "more-than": "Rozsah dátumu by nemal byť menší ako %d dní",
                "default-more": "Prosím zvoľte rozsah dlhší ako %d dní",
                "default-single": "Prosím zvoľte dátum",
                "default-less": "Prosím zvoľte rozsah menší ako %d dní",
                "default-range": "Prosím zvoľte rozsah medzi %d a %d dňami",
                "default-default": "Prosím zvoľte rozsah",
                time: "Čas",
                hour: "Hodina",
                minute: "Minúta",
            };
        }
    }

    beforeDestroy() {
        //$(this.$el).find('input')['minicolors']('method', 'destroy');
    }

    render(h) {
        return (
            <TextBox
                label={this.label}
                labelButtons={this.labelButtons}
                subtitle={this.subtitle}
                cssClass={this.cssClass}
                value={this.getRangeText(this.currentValue)}
                placeholder={this.placeholder}
                mandatory={this.mandatory}
                wrap={this.wrap}
                appendIcon={this.appendIcon}
                prependIcon={this.prependIcon}
                hint={this.hint}
                marginType={this.marginType}
                appendClicked={this.appendClicked}
                prependClicked={this.prependClicked}
                validationState={this.validationState}
                changed={null}
            />
        );
    }
}

export default toNative(DaterangePicker);
