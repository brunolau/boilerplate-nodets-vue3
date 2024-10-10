import { toNative, Prop, Watch } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import { FormItemWrapperArgs, MarginType } from "../form/form-item-wrapper";
import { DropdownButtonItemArgs } from "../dropdown-button/dropdown-button-item";
import DropdownList from ".";

interface CountryDropdownArgs extends FormItemWrapperArgs {
    value?: string | string[];
    placeholder?: string;
    multiselect?: boolean;
    subtitle?: string;
    changed?: (newValue: string | string[]) => void;
}

export function getCountryCodeArr(): Array<Array<string>> {
    return [
        ["AFG", "Afghanistan"],
        ["ALB", "Albania"],
        ["ALG", "Algeria"],
        ["ASM", "American Samoa"],
        ["AND", "Andorra"],
        ["ANG", "Angola"],
        ["ANT", "Anguilla"],
        ["AQ", "Antarctica"],
        ["ARG", "Argentina"],
        ["ARM", "Armenia"],
        ["ARU", "Aruba"],
        ["AUS", "Australia"],
        ["AUT", "Austria"],
        ["AZE", "Azerbaijan"],
        ["BAH", "Bahamas"],
        ["BRN", "Bahrain"],
        ["BAN", "Bangladesh"],
        ["BAR", "Barbados"],
        ["BLR", "Belarus"],
        ["BEL", "Belgium"],
        ["BLZ", "Belize"],
        ["BEN", "Benin"],
        ["BER", "Bermuda"],
        ["BHU", "Bhutan"],
        ["BOL", "Bolivia"],
        ["BIH", "Bosnia and Herzegowina"],
        ["BOT", "Botswana"],
        ["BVT", "Bouvet Island"],
        ["BRA", "Brazil"],
        ["BI", "British Indian Ocean Territory"],
        ["BRU", "Brunei Darussalam"],
        ["BUL", "Bulgaria"],
        ["BUR", "Burkina Faso"],
        ["BDI", "Burundi"],
        ["CAM", "Cambodia"],
        ["CMR", "Cameroon"],
        ["CAN", "Canada"],
        ["CPV", "Cape Verde"],
        ["CYM", "Cayman Islands"],
        ["CAF", "Central African Republic"],
        ["CHA", "Chad"],
        ["CHI", "Chile"],
        ["CHN", "China"],
        ["CX", "Christmas Island"],
        ["CC", "Cocos (Keeling) Islands"],
        ["COL", "Colombia"],
        ["COM", "Comoros"],
        ["CGO", "Congo"],
        ["COD", "Congo, the Democratic Republic of the"],
        ["COK", "Cook Islands"],
        ["CRC", "Costa Rica"],
        ["CIV", "Cote d'Ivoire"],
        ["CRO", "Croatia (Hrvatska)"],
        ["CUB", "Cuba"],
        ["CYP", "Cyprus"],
        ["CZE", "Czech Republic"],
        ["DEN", "Denmark"],
        ["DJI", "Djibouti"],
        ["DMA", "Dominica"],
        ["DOM", "Dominican Republic"],
        ["ECU", "Ecuador"],
        ["EGY", "Egypt"],
        ["ESA", "El Salvador"],
        ["GEQ", "Equatorial Guinea"],
        ["ERI", "Eritrea"],
        ["EST", "Estonia"],
        ["ETH", "Ethiopia"],
        ["FKL", "Falkland Islands (Malvinas)"],
        ["FRO", "Faroe Islands"],
        ["FJI", "Fiji"],
        ["FIN", "Finland"],
        ["FRA", "France"],
        ["GF", "French Guiana"],
        ["PF", "French Polynesia"],
        ["TF", "French Southern Territories"],
        ["GAB", "Gabon"],
        ["GAM", "Gambia"],
        ["GEO", "Georgia"],
        ["GER", "Germany"],
        ["GHA", "Ghana"],
        ["GIB", "Gibraltar"],
        ["GRE", "Greece"],
        ["GL", "Greenland"],
        ["GRN", "Grenada"],
        ["GP", "Guadeloupe"],
        ["GUM", "Guam"],
        ["GUA", "Guatemala"],
        ["GUI", "Guinea"],
        ["GBS", "Guinea-Bissau"],
        ["GUY", "Guyana"],
        ["HAI", "Haiti"],
        ["HM", "Heard and Mc Donald Islands"],
        ["VAT", "Holy See (Vatican City State)"],
        ["HON", "Honduras"],
        ["HKG", "Hong Kong"],
        ["HUN", "Hungary"],
        ["ISL", "Iceland"],
        ["IND", "India"],
        ["INA", "Indonesia"],
        ["IRI", "Iran (Islamic Republic of)"],
        ["IRQ", "Iraq"],
        ["IRL", "Ireland"],
        ["ISR", "Israel"],
        ["ITA", "Italy"],
        ["JAM", "Jamaica"],
        ["JPN", "Japan"],
        ["JOR", "Jordan"],
        ["KAZ", "Kazakhstan"],
        ["KEN", "Kenya"],
        ["KIR", "Kiribati"],
        ["KP", "Korea, Democratic People's Republic of"],
        ["KOR", "Korea, Republic of"],
        ["KUW", "Kuwait"],
        ["KGZ", "Kyrgyzstan"],
        ["LAO", "Lao People's Democratic Republic"],
        ["LAT", "Latvia"],
        ["LIB", "Lebanon"],
        ["LES", "Lesotho"],
        ["LBR", "Liberia"],
        ["LBA", "Libyan Arab Jamahiriya"],
        ["LIE", "Liechtenstein"],
        ["LTU", "Lithuania"],
        ["LUX", "Luxembourg"],
        ["MO", "Macau"],
        ["MKD", "Macedonia, The Former Yugoslav Republic of"],
        ["MAD", "Madagascar"],
        ["MAW", "Malawi"],
        ["MAS", "Malaysia"],
        ["MDV", "Maldives"],
        ["MLI", "Mali"],
        ["MLT", "Malta"],
        ["MHL", "Marshall Islands"],
        ["MQ", "Martinique"],
        ["MTN", "Mauritania"],
        ["MRI", "Mauritius"],
        ["YT", "Mayotte"],
        ["MEX", "Mexico"],
        ["FSM", "Micronesia, Federated States of"],
        ["MDA", "Moldova, Republic of"],
        ["MON", "Monaco"],
        ["MGL", "Mongolia"],
        ["ME", "Montenegro"],
        ["MS", "Montserrat"],
        ["MAR", "Morocco"],
        ["MOZ", "Mozambique"],
        ["MYA", "Myanmar"],
        ["NAM", "Namibia"],
        ["NRU", "Nauru"],
        ["NEP", "Nepal"],
        ["NED", "Netherlands"],
        ["AHO", "Netherlands Antilles"],
        ["NC", "New Caledonia"],
        ["NZL", "New Zealand"],
        ["NCA", "Nicaragua"],
        ["NIG", "Niger"],
        ["NGR", "Nigeria"],
        ["NU", "Niue"],
        ["NF", "Norfolk Island"],
        ["MP", "Northern Mariana Islands"],
        ["NOR", "Norway"],
        ["OMA", "Oman"],
        ["PAK", "Pakistan"],
        ["PLW", "Palau"],
        ["PAN", "Panama"],
        ["PNG", "Papua New Guinea"],
        ["PAR", "Paraguay"],
        ["PER", "Peru"],
        ["PHI", "Philippines"],
        ["PN", "Pitcairn"],
        ["POL", "Poland"],
        ["POR", "Portugal"],
        ["PUR", "Puerto Rico"],
        ["QAT", "Qatar"],
        ["RE", "Reunion"],
        ["ROU", "Romania"],
        ["RUS", "Russian Federation"],
        ["RWA", "Rwanda"],
        ["SKN", "Saint Kitts and Nevis"],
        ["LC", "Saint LUCIA"],
        ["VC", "Saint Vincent and the Grenadines"],
        ["SAM", "Samoa"],
        ["SMR", "San Marino"],
        ["STP", "Sao Tome and Principe"],
        ["KSA", "Saudi Arabia"],
        ["SEN", "Senegal"],
        ["SER", "Serbia"],
        ["SEY", "Seychelles"],
        ["SLE", "Sierra Leone"],
        ["SIN", "Singapore"],
        ["SVK", "Slovakia (Slovak Republic)"],
        ["SVN", "Slovenia"],
        ["SOL", "Solomon Islands"],
        ["SOM", "Somalia"],
        ["RSA", "South Africa"],
        ["GS", "South Georgia and the South Sandwich Islands"],
        ["ESP", "Spain"],
        ["SRI", "Sri Lanka"],
        ["SH", "St. Helena"],
        ["PM", "St. Pierre and Miquelon"],
        ["SUD", "Sudan"],
        ["SUR", "Suriname"],
        ["SJ", "Svalbard and Jan Mayen Islands"],
        ["SWZ", "Swaziland"],
        ["SWE", "Sweden"],
        ["SUI", "Switzerland"],
        ["SYR", "Syrian Arab Republic"],
        ["TPE", "Taiwan, Province of China"],
        ["TJK", "Tajikistan"],
        ["TAN", "Tanzania, United Republic of"],
        ["THA", "Thailand"],
        ["TOG", "Togo"],
        ["TK", "Tokelau"],
        ["TGA", "Tonga"],
        ["TRI", "Trinidad and Tobago"],
        ["TUN", "Tunisia"],
        ["TUR", "Turkey"],
        ["TKM", "Turkmenistan"],
        ["TC", "Turks and Caicos Islands"],
        ["TUV", "Tuvalu"],
        ["UGA", "Uganda"],
        ["UKR", "Ukraine"],
        ["UAE", "United Arab Emirates"],
        ["GBR", "United Kingdom"],
        ["USA", "United States"],
        ["UM", "United States Minor Outlying Islands"],
        ["URU", "Uruguay"],
        ["UZB", "Uzbekistan"],
        ["VAN", "Vanuatu"],
        ["VEN", "Venezuela"],
        ["VIE", "Viet Nam"],
        ["IVB", "Virgin Islands (British)"],
        ["IVA", "Virgin Islands (U.S.)"],
        ["WF", "Wallis and Futuna Islands"],
        ["EH", "Western Sahara"],
        ["YEM", "Yemen"],
        ["ZAM", "Zambia"],
        ["ZIM", "Zimbabwe"],
    ];
}

function getFlaggedResult(state): string | JQuery {
    if (!state) return "";
    if (!state.id) return state.text;
    return $('<span><img class="flag" src="https://inviton-cdn.azureedge.net/assets/img/flags/' + state.id.toLowerCase() + '.png"/>&nbsp;&nbsp;' + state.text + "</span>");
}

@Component
class CountryDropdown extends TsxComponent<CountryDropdownArgs> implements CountryDropdownArgs {
    @Prop() label!: string;
    @Prop() labelButtons: DropdownButtonItemArgs[];
    @Prop() value!: string | string[];
    @Prop() placeholder!: string;
    @Prop() mandatory!: boolean;
    @Prop() marginType?: MarginType;
    @Prop() multiselect?: boolean;
    @Prop() wrap!: boolean;
    @Prop() hint: string;
    @Prop() subtitle: string;
    @Prop() appendIcon: string;
    @Prop() prependIcon: string;
    @Prop() appendClicked: () => void;
    @Prop() prependClicked: () => void;
    @Prop() changed: (newValue: string | string[]) => void;

    currentValue: string | string[];

    mounted() {
        this.currentValue = this.value;
    }

    @Watch("value")
    updateValue() {
        this.currentValue = this.value;
    }

    isArray(e: string | string[]): boolean {
        return e != null && e["push"] && e["pop"];
    }

    raiseChangeEvent(e) {
        this.populateValidationDeclaration();

        if (this.changed != null) {
            let selVal = e[0];
            if (selVal == null) {
                this.changed(null);
                return;
            }

            let newValue: string | string[];
            if (this.isArray(selVal)) {
                newValue = (e as string[][]).map((p) => p[0]);
            } else {
                newValue = selVal;
            }

            this.currentValue = newValue;
            this.changed(newValue);
        }
    }

    getValue() {
        if (!isNullOrEmpty(this.currentValue)) {
            if (!this.isArray(this.currentValue)) {
                return [[this.currentValue], "WHATEVER"];
            } else {
                let retVal = [];
                (this.currentValue as string[]).forEach((cty) => {
                    retVal.push([cty, cty]);
                });

                return retVal;
            }
        }

        return null;
    }

    render(h) {
        return (
            <DropdownList
                options={getCountryCodeArr()}
                displayMember="1"
                valueMember="0"
                formatResult={(e) => {
                    return getFlaggedResult(e);
                }}
                formatSelection={(e) => {
                    return getFlaggedResult(e);
                }}
                wrap={this.wrap}
                mandatory={this.mandatory}
                multiselect={this.multiselect}
                label={this.label}
                labelButtons={this.labelButtons}
                selected={this.getValue()}
                subtitle={this.subtitle}
                hint={this.hint}
                appendIcon={this.appendIcon}
                prependIcon={this.prependIcon}
                appendClicked={this.appendClicked}
                prependClicked={this.prependClicked}
                marginType={this.marginType}
                changed={(e) => this.raiseChangeEvent(e)}
            />
        );
    }
}

export default toNative(CountryDropdown);
