import { toNative, Prop, Watch } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import FormItemWrapper, { FormItemWrapperArgs, MarginType } from "../form/form-item-wrapper";
import TextBox from "../input/textbox";
import { CountryISOMapping } from "../../common/country-iso-mapping";
import GoogleMapsApiLoader from "./ts/google-maps-api";
import { GOOGLE_API_KEY, GEONAMES_USERNAME } from "./ts/apiKey";
import { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";

interface GooglePlacesAutocompleteValue {
    latitude: string;
    longitude: string;
    name: string;
    googlePlace: any;
}

interface TimezoneData {
    dstOffset: number;
    gmtOffset: number;
    timezoneId: string;
}

interface GooglePlacesAutocompleteArgs extends FormItemWrapperArgs {
    value?: string;
    placeholder?: string;
    changed: (newValue: GooglePlacesChangedArgs) => void;
    bound: () => void;
    resultType?: GooglePlacesResultType;
    timezoneRequired?: boolean;
}

interface GooglePlacesAutocompleteSingletonArgs {
    element: HTMLElement;
    resultType: GooglePlacesResultType;
    changed: (args: GooglePlacesChangedArgs) => void;
}

export interface GooglePlacesChangedArgs {
    name: string;
    street: string;
    zip: string;
    city: string;
    country: string;
    gpsLatitude: string;
    gpsLongitude: string;
    fullName: string;
    inputValue: string;
    dstOffset?: number;
    gmtOffset?: number;
    timezoneName?: string;
}

export const enum GooglePlacesResultType {
    All = 0,
    Address = 1,
    City = 2,
}

@Component
class GooglePlacesAutocomplete extends TsxComponent<GooglePlacesAutocompleteArgs> implements GooglePlacesAutocompleteArgs {
    @Prop() label!: string;
    @Prop() labelButtons!: DropdownButtonItemArgs[];
    @Prop() subtitle!: string;
    @Prop() placeholder!: string;
    @Prop() mandatory!: boolean;
    @Prop() wrap!: boolean;
    @Prop() hint: string;
    @Prop() appendIcon: string;
    @Prop() prependIcon: string;
    @Prop() maxWidth?: number;
    @Prop() marginType?: MarginType;
    @Prop() resultType: GooglePlacesResultType;
    @Prop() appendClicked: () => void;
    @Prop() prependClicked: () => void;
    @Prop() bound: () => void;
    @Prop() changed: (newValue: GooglePlacesChangedArgs) => void;
    @Prop() value: string;
    @Prop() timezoneRequired: boolean;
    currentValue: string = null;

    raiseChangeEvent(e: GooglePlacesChangedArgs) {
        this.populateValidationDeclaration();

        if (this.changed != null) {
            this.changed(e);
        }
    }

    trySetInputValue(val: string): void {
        try {
            this.$refs.googleInput["value"] = val;
        } catch (e) {}
    }

    mounted() {
        var mySelf = this;
        this.currentValue = this.value;

        GoogleMapsApiLoader;
        GoogleMapsApiLoader.load().then((result) => {
            if (result) {
                GooglePlacesAutocompleteWrapper.bind({
                    element: this.$el.querySelector("input"),
                    resultType: this.resultType || GooglePlacesResultType.All,
                    changed(changeArgs) {
                        if (mySelf.timezoneRequired != true) {
                            mySelf.raiseChangeEvent(changeArgs);
                        } else {
                            GooglePlacesUtils.getTimezone(changeArgs).then(function (data) {
                                changeArgs.dstOffset = data.dstOffset;
                                changeArgs.gmtOffset = data.gmtOffset;
                                changeArgs.timezoneName = data.timezoneId;

                                if (changeArgs.timezoneName != null && changeArgs.timezoneName.toLowerCase().contains("bratislava")) {
                                    changeArgs.timezoneName = "Europe/Vienna";
                                } else if (changeArgs.dstOffset == 120 && changeArgs.gmtOffset == 60) {
                                    changeArgs.timezoneName = "Europe/Vienna";
                                }

                                mySelf.raiseChangeEvent(changeArgs);
                            });
                        }
                    },
                });
            }
        });

        this.$nextTick(() => {
            this.$refs.googleInput["value"] = this.currentValue;
        });
    }

    @Watch("value")
    updateValue() {
        this.currentValue = this.value;
    }

    render(h) {
        return (
            <FormItemWrapper
                label={this.label}
                mandatory={this.mandatory}
                wrap={this.wrap}
                appendIcon={this.appendIcon}
                prependIcon={this.prependIcon}
                hint={this.hint}
                appendClicked={this.appendClicked}
                marginType={this.marginType}
                maxWidth={this.maxWidth}
                prependClicked={this.prependClicked}
                validationState={this.validationState}
                labelButtons={this.labelButtons}
                subtitle={this.subtitle}
            >
                <input ref="googleInput" type="text" class="form-control maxwidth-input" placeholder={this.placeholder} />
            </FormItemWrapper>
        );
    }
}

class GooglePlacesUtils {
    static getName(place: any, type: GooglePlacesResultType): string {
        if (type != GooglePlacesResultType.Address) {
            if (place.types && place.types.indexOf("establishment") > -1) {
                return place.name;
            }

            if (!isNullOrEmpty(place["adr_address"])) {
                try {
                    return place["adr_address"].split("</span>")[0].split(">")[1];
                } catch (e) {}
            }

            return place.name;
        } else {
            return GooglePlacesUtils.getStreet(place);
        }
    }

    static getStreet(place: any): string {
        let ac: any[] = place.address_components;
        let houseNo: string = "";
        let street: string = "";

        if (!isNullOrEmpty(ac)) {
            ac.forEach((acItem) => {
                if (acItem.types) {
                    if (acItem.types.contains("street_number")) {
                        houseNo = acItem.long_name;
                    } else if (acItem.types.contains("route")) {
                        street = acItem.long_name;
                    }
                }
            });
        }

        return (street + " " + houseNo).trim();
    }

    static getCity(place: any, resultType: GooglePlacesResultType): string {
        if (resultType == GooglePlacesResultType.City) {
            return GooglePlacesUtils.getName(place, resultType);
        }

        var retVal: string;
        if (!isNullOrEmpty(place.address_components)) {
            var adminArea: string;
            for (var i = 0; i < place.address_components.length; i++) {
                var ac = place.address_components[i];
                if (ac.types) {
                    if (ac.types.contains("locality")) {
                        retVal = ac.short_name;
                    } else {
                        for (var j = 0; j < ac.types.length; j++) {
                            var acType = ac.types[j];
                            if (acType.contains("administrative_area") && isNullOrEmpty(adminArea)) {
                                adminArea = ac.short_name;
                            }
                        }
                    }
                }
            }

            if (isNullOrEmpty(retVal)) {
                retVal = adminArea;
            }
        }

        if (!isNullOrEmpty(retVal)) {
            var rlc = retVal.toLowerCase();
            if (rlc.contains("bratislava")) {
                return "Bratislava";
            } else if (rlc.contains("praha")) {
                return "Praha";
            }

            return retVal;
        }

        return GooglePlacesUtils.getName(place, resultType);
    }

    static getZIP(place: any): string {
        let ac: any[] = place.address_components;
        if (!isNullOrEmpty(ac)) {
            for (var i = 0, len = ac.length; i < len; i++) {
                var acItem = ac[i];
                if (acItem.types.contains("postal_code")) {
                    return acItem.short_name.replaceAll(" ", "");
                }
            }
        }

        return null;
    }

    static getCountry(place: any): string {
        let ac: any[] = place.address_components;
        if (!isNullOrEmpty(ac)) {
            for (var i = 0, len = ac.length; i < len; i++) {
                var acItem = ac[i];
                if (acItem.types.contains("country")) {
                    return CountryISOMapping[acItem.short_name] || acItem.short_name;
                }
            }
        }

        return null;
    }

    static getPlacesRestrictionCode(resultType: GooglePlacesResultType): string {
        if (resultType == GooglePlacesResultType.Address) {
            return "address";
        } else if (resultType == GooglePlacesResultType.City) {
            return "(cities)";
        }

        return null;
    }

    static getTimezone(args: GooglePlacesChangedArgs): Promise<TimezoneData> {
        return new Promise(function (resolve, reject) {
            appHttpProvider
                .callAjax({
                    type: "GET",
                    url: "https://secure.geonames.org/timezoneJSON?lat=" + args.gpsLatitude + "&lng=" + args.gpsLongitude + "&username=" + GEONAMES_USERNAME,
                })
                .then(function (data: any) {
                    resolve({
                        dstOffset: data.dstOffset * 60,
                        gmtOffset: data.gmtOffset * 60,
                        timezoneId: data.timezoneId,
                    });
                });
        });
    }
}

class GooglePlacesAutocompleteWrapper {
    static bind(args: GooglePlacesAutocompleteSingletonArgs): void {
        var acArgs: any;
        if (args.resultType != GooglePlacesResultType.All) {
            acArgs = {
                types: [GooglePlacesUtils.getPlacesRestrictionCode(args.resultType)],
            };
        }

        var autocomplete = new window["google"].maps.places.Autocomplete(args.element, acArgs);
        autocomplete.addListener("place_changed", () => {
            let place = autocomplete.getPlace();
            let name = GooglePlacesUtils.getName(place, args.resultType);
            args.element["value"] = name;

            args.changed({
                name: name,
                fullName: place.formatted_address,
                inputValue: args.element["value"],
                street: GooglePlacesUtils.getStreet(place),
                city: GooglePlacesUtils.getCity(place, args.resultType),
                zip: GooglePlacesUtils.getZIP(place),
                country: GooglePlacesUtils.getCountry(place),
                gpsLatitude: place.geometry.location.lat(),
                gpsLongitude: place.geometry.location.lng(),
            });
        });
    }
}

export default toNative(GooglePlacesAutocomplete);
