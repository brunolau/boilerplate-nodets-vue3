import { Prop, toNative } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import DropdownList, { DropdownOptionGroup } from "../../framework/dropdown";

export class TimeZoneModel {
    id: string = null;
    text: string = null;
}

interface TimezonePickerArgs {
    selected: string;
    mandatory?: boolean;
    label?: string;
    placeholder?: string;
    validationState?: ValidationState;
    wrap?: boolean;
    changed: (e: TimeZoneModel) => void;
}

@Component
class TimezonePicker extends TsxComponent<TimezonePickerArgs> implements TimezonePickerArgs {
    @Prop() selected: string;
    @Prop() mandatory!: boolean;
    @Prop() label!: string;
    @Prop() placeholder: string;
    @Prop() wrap!: boolean;
    @Prop() changed: (e: TimeZoneModel) => void;

    getOptionList(): DropdownOptionGroup[] {
        return [
            {
                isOptGroup: true,
                text: "America",
                children: [
                    { id: "America/Adak", text: "America/Adak" },
                    { id: "America/Anchorage", text: "America/Anchorage" },
                    { id: "America/Anguilla", text: "America/Anguilla" },
                    { id: "America/Antigua", text: "America/Antigua" },
                    { id: "America/Araguaina", text: "America/Araguaina" },
                    { id: "America/Argentina/Buenos_Aires", text: "America/Argentina/Buenos_Aires" },
                    { id: "America/Argentina/Catamarca", text: "America/Argentina/Catamarca" },
                    { id: "America/Argentina/Cordoba", text: "America/Argentina/Cordoba" },
                    { id: "America/Argentina/Jujuy", text: "America/Argentina/Jujuy" },
                    { id: "America/Argentina/La_Rioja", text: "America/Argentina/La_Rioja" },
                    { id: "America/Argentina/Mendoza", text: "America/Argentina/Mendoza" },
                    { id: "America/Argentina/Rio_Gallegos", text: "America/Argentina/Rio_Gallegos" },
                    { id: "America/Argentina/Salta", text: "America/Argentina/Salta" },
                    { id: "America/Argentina/San_Juan", text: "America/Argentina/San_Juan" },
                    { id: "America/Argentina/San_Luis", text: "America/Argentina/San_Luis" },
                    { id: "America/Argentina/Tucuman", text: "America/Argentina/Tucuman" },
                    { id: "America/Argentina/Ushuaia", text: "America/Argentina/Ushuaia" },
                    { id: "America/Aruba", text: "America/Aruba" },
                    { id: "America/Asuncion", text: "America/Asuncion" },
                    { id: "America/Atikokan", text: "America/Atikokan" },
                    { id: "America/Bahia", text: "America/Bahia" },
                    { id: "America/Bahia_Banderas", text: "America/Bahia_Banderas" },
                    { id: "America/Barbados", text: "America/Barbados" },
                    { id: "America/Belem", text: "America/Belem" },
                    { id: "America/Belize", text: "America/Belize" },
                    { id: "America/Blanc-Sablon", text: "America/Blanc-Sablon" },
                    { id: "America/Boa_Vista", text: "America/Boa_Vista" },
                    { id: "America/Bogota", text: "America/Bogota" },
                    { id: "America/Boise", text: "America/Boise" },
                    { id: "America/Cambridge_Bay", text: "America/Cambridge_Bay" },
                    { id: "America/Campo_Grande", text: "America/Campo_Grande" },
                    { id: "America/Cancun", text: "America/Cancun" },
                    { id: "America/Caracas", text: "America/Caracas" },
                    { id: "America/Cayenne", text: "America/Cayenne" },
                    { id: "America/Cayman", text: "America/Cayman" },
                    { id: "America/Chicago", text: "America/Chicago" },
                    { id: "America/Chihuahua", text: "America/Chihuahua" },
                    { id: "America/Costa_Rica", text: "America/Costa_Rica" },
                    { id: "America/Creston", text: "America/Creston" },
                    { id: "America/Cuiaba", text: "America/Cuiaba" },
                    { id: "America/Curacao", text: "America/Curacao" },
                    { id: "America/Danmarkshavn", text: "America/Danmarkshavn" },
                    { id: "America/Dawson", text: "America/Dawson" },
                    { id: "America/Dawson_Creek", text: "America/Dawson_Creek" },
                    { id: "America/Denver", text: "America/Denver" },
                    { id: "America/Detroit", text: "America/Detroit" },
                    { id: "America/Dominica", text: "America/Dominica" },
                    { id: "America/Edmonton", text: "America/Edmonton" },
                    { id: "America/Eirunepe", text: "America/Eirunepe" },
                    { id: "America/El_Salvador", text: "America/El_Salvador" },
                    { id: "America/Fort_Nelson", text: "America/Fort_Nelson" },
                    { id: "America/Fortaleza", text: "America/Fortaleza" },
                    { id: "America/Glace_Bay", text: "America/Glace_Bay" },
                    { id: "America/Godthab", text: "America/Godthab" },
                    { id: "America/Goose_Bay", text: "America/Goose_Bay" },
                    { id: "America/Grand_Turk", text: "America/Grand_Turk" },
                    { id: "America/Grenada", text: "America/Grenada" },
                    { id: "America/Guadeloupe", text: "America/Guadeloupe" },
                    { id: "America/Guatemala", text: "America/Guatemala" },
                    { id: "America/Guayaquil", text: "America/Guayaquil" },
                    { id: "America/Guyana", text: "America/Guyana" },
                    { id: "America/Halifax", text: "America/Halifax" },
                    { id: "America/Havana", text: "America/Havana" },
                    { id: "America/Hermosillo", text: "America/Hermosillo" },
                    { id: "America/Indiana/Indianapolis", text: "America/Indiana/Indianapolis" },
                    { id: "America/Indiana/Knox", text: "America/Indiana/Knox" },
                    { id: "America/Indiana/Marengo", text: "America/Indiana/Marengo" },
                    { id: "America/Indiana/Petersburg", text: "America/Indiana/Petersburg" },
                    { id: "America/Indiana/Tell_City", text: "America/Indiana/Tell_City" },
                    { id: "America/Indiana/Vevay", text: "America/Indiana/Vevay" },
                    { id: "America/Indiana/Vincennes", text: "America/Indiana/Vincennes" },
                    { id: "America/Indiana/Winamac", text: "America/Indiana/Winamac" },
                    { id: "America/Inuvik", text: "America/Inuvik" },
                    { id: "America/Iqaluit", text: "America/Iqaluit" },
                    { id: "America/Jamaica", text: "America/Jamaica" },
                    { id: "America/Juneau", text: "America/Juneau" },
                    { id: "America/Kentucky/Louisville", text: "America/Kentucky/Louisville" },
                    { id: "America/Kentucky/Monticello", text: "America/Kentucky/Monticello" },
                    { id: "America/Kralendijk", text: "America/Kralendijk" },
                    { id: "America/La_Paz", text: "America/La_Paz" },
                    { id: "America/Lima", text: "America/Lima" },
                    { id: "America/Los_Angeles", text: "America/Los_Angeles" },
                    { id: "America/Lower_Princes", text: "America/Lower_Princes" },
                    { id: "America/Maceio", text: "America/Maceio" },
                    { id: "America/Managua", text: "America/Managua" },
                    { id: "America/Manaus", text: "America/Manaus" },
                    { id: "America/Marigot", text: "America/Marigot" },
                    { id: "America/Martinique", text: "America/Martinique" },
                    { id: "America/Matamoros", text: "America/Matamoros" },
                    { id: "America/Mazatlan", text: "America/Mazatlan" },
                    { id: "America/Menominee", text: "America/Menominee" },
                    { id: "America/Merida", text: "America/Merida" },
                    { id: "America/Metlakatla", text: "America/Metlakatla" },
                    { id: "America/Mexico_City", text: "America/Mexico_City" },
                    { id: "America/Miquelon", text: "America/Miquelon" },
                    { id: "America/Moncton", text: "America/Moncton" },
                    { id: "America/Monterrey", text: "America/Monterrey" },
                    { id: "America/Montevideo", text: "America/Montevideo" },
                    { id: "America/Montserrat", text: "America/Montserrat" },
                    { id: "America/Nassau", text: "America/Nassau" },
                    { id: "America/New_York", text: "America/New_York" },
                    { id: "America/Nipigon", text: "America/Nipigon" },
                    { id: "America/Nome", text: "America/Nome" },
                    { id: "America/Noronha", text: "America/Noronha" },
                    { id: "America/North_Dakota/Beulah", text: "America/North_Dakota/Beulah" },
                    { id: "America/North_Dakota/Center", text: "America/North_Dakota/Center" },
                    { id: "America/North_Dakota/New_Salem", text: "America/North_Dakota/New_Salem" },
                    { id: "America/Ojinaga", text: "America/Ojinaga" },
                    { id: "America/Panama", text: "America/Panama" },
                    { id: "America/Pangnirtung", text: "America/Pangnirtung" },
                    { id: "America/Paramaribo", text: "America/Paramaribo" },
                    { id: "America/Phoenix", text: "America/Phoenix" },
                    { id: "America/Port-au-Prince", text: "America/Port-au-Prince" },
                    { id: "America/Port_of_Spain", text: "America/Port_of_Spain" },
                    { id: "America/Porto_Velho", text: "America/Porto_Velho" },
                    { id: "America/Puerto_Rico", text: "America/Puerto_Rico" },
                    { id: "America/Rainy_River", text: "America/Rainy_River" },
                    { id: "America/Rankin_Inlet", text: "America/Rankin_Inlet" },
                    { id: "America/Recife", text: "America/Recife" },
                    { id: "America/Regina", text: "America/Regina" },
                    { id: "America/Resolute", text: "America/Resolute" },
                    { id: "America/Rio_Branco", text: "America/Rio_Branco" },
                    { id: "America/Santarem", text: "America/Santarem" },
                    { id: "America/Santiago", text: "America/Santiago" },
                    { id: "America/Santo_Domingo", text: "America/Santo_Domingo" },
                    { id: "America/Sao_Paulo", text: "America/Sao_Paulo" },
                    { id: "America/Scoresbysund", text: "America/Scoresbysund" },
                    { id: "America/Sitka", text: "America/Sitka" },
                    { id: "America/St_Barthelemy", text: "America/St_Barthelemy" },
                    { id: "America/St_Johns", text: "America/St_Johns" },
                    { id: "America/St_Kitts", text: "America/St_Kitts" },
                    { id: "America/St_Lucia", text: "America/St_Lucia" },
                    { id: "America/St_Thomas", text: "America/St_Thomas" },
                    { id: "America/St_Vincent", text: "America/St_Vincent" },
                    { id: "America/Swift_Current", text: "America/Swift_Current" },
                    { id: "America/Tegucigalpa", text: "America/Tegucigalpa" },
                    { id: "America/Thule", text: "America/Thule" },
                    { id: "America/Thunder_Bay", text: "America/Thunder_Bay" },
                    { id: "America/Tijuana", text: "America/Tijuana" },
                    { id: "America/Toronto", text: "America/Toronto" },
                    { id: "America/Tortola", text: "America/Tortola" },
                    { id: "America/Vancouver", text: "America/Vancouver" },
                    { id: "America/Whitehorse", text: "America/Whitehorse" },
                    { id: "America/Winnipeg", text: "America/Winnipeg" },
                    { id: "America/Yakutat", text: "America/Yakutat" },
                    { id: "America/Yellowknife", text: "America/Yellowknife" },
                ],
            },
            {
                isOptGroup: true,
                text: "Australia",
                children: [
                    { id: "Australia/Adelaide", text: "Australia/Adelaide" },
                    { id: "Australia/Brisbane", text: "Australia/Brisbane" },
                    { id: "Australia/Broken_Hill", text: "Australia/Broken_Hill" },
                    { id: "Australia/Currie", text: "Australia/Currie" },
                    { id: "Australia/Darwin", text: "Australia/Darwin" },
                    { id: "Australia/Eucla", text: "Australia/Eucla" },
                    { id: "Australia/Hobart", text: "Australia/Hobart" },
                    { id: "Australia/Lindeman", text: "Australia/Lindeman" },
                    { id: "Australia/Lord_Howe", text: "Australia/Lord_Howe" },
                    { id: "Australia/Melbourne", text: "Australia/Melbourne" },
                    { id: "Australia/Perth", text: "Australia/Perth" },
                    { id: "Australia/Sydney", text: "Australia/Sydney" },
                ],
            },
            {
                isOptGroup: true,
                text: "Europe",
                children: [
                    { id: "Europe/Amsterdam", text: "Europe/Amsterdam" },
                    { id: "Europe/Andorra", text: "Europe/Andorra" },
                    { id: "Europe/Astrakhan", text: "Europe/Astrakhan" },
                    { id: "Europe/Athens", text: "Europe/Athens" },
                    { id: "Europe/Belgrade", text: "Europe/Belgrade" },
                    { id: "Europe/Berlin", text: "Europe/Berlin" },
                    { id: "Europe/Bratislava", text: "Europe/Bratislava" },
                    { id: "Europe/Brussels", text: "Europe/Brussels" },
                    { id: "Europe/Bucharest", text: "Europe/Bucharest" },
                    { id: "Europe/Budapest", text: "Europe/Budapest" },
                    { id: "Europe/Busingen", text: "Europe/Busingen" },
                    { id: "Europe/Chisinau", text: "Europe/Chisinau" },
                    { id: "Europe/Copenhagen", text: "Europe/Copenhagen" },
                    { id: "Europe/Dublin", text: "Europe/Dublin" },
                    { id: "Europe/Gibraltar", text: "Europe/Gibraltar" },
                    { id: "Europe/Guernsey", text: "Europe/Guernsey" },
                    { id: "Europe/Helsinki", text: "Europe/Helsinki" },
                    { id: "Europe/Isle_of_Man", text: "Europe/Isle_of_Man" },
                    { id: "Europe/Istanbul", text: "Europe/Istanbul" },
                    { id: "Europe/Jersey", text: "Europe/Jersey" },
                    { id: "Europe/Kaliningrad", text: "Europe/Kaliningrad" },
                    { id: "Europe/Kiev", text: "Europe/Kiev" },
                    { id: "Europe/Kirov", text: "Europe/Kirov" },
                    { id: "Europe/Lisbon", text: "Europe/Lisbon" },
                    { id: "Europe/Ljubljana", text: "Europe/Ljubljana" },
                    { id: "Europe/London", text: "Europe/London" },
                    { id: "Europe/Luxembourg", text: "Europe/Luxembourg" },
                    { id: "Europe/Madrid", text: "Europe/Madrid" },
                    { id: "Europe/Malta", text: "Europe/Malta" },
                    { id: "Europe/Mariehamn", text: "Europe/Mariehamn" },
                    { id: "Europe/Minsk", text: "Europe/Minsk" },
                    { id: "Europe/Monaco", text: "Europe/Monaco" },
                    { id: "Europe/Moscow", text: "Europe/Moscow" },
                    { id: "Europe/Oslo", text: "Europe/Oslo" },
                    { id: "Europe/Paris", text: "Europe/Paris" },
                    { id: "Europe/Podgorica", text: "Europe/Podgorica" },
                    { id: "Europe/Prague", text: "Europe/Prague" },
                    { id: "Europe/Riga", text: "Europe/Riga" },
                    { id: "Europe/Rome", text: "Europe/Rome" },
                    { id: "Europe/Samara", text: "Europe/Samara" },
                    { id: "Europe/San_Marino", text: "Europe/San_Marino" },
                    { id: "Europe/Sarajevo", text: "Europe/Sarajevo" },
                    { id: "Europe/Simferopol", text: "Europe/Simferopol" },
                    { id: "Europe/Skopje", text: "Europe/Skopje" },
                    { id: "Europe/Sofia", text: "Europe/Sofia" },
                    { id: "Europe/Stockholm", text: "Europe/Stockholm" },
                    { id: "Europe/Tallinn", text: "Europe/Tallinn" },
                    { id: "Europe/Tirane", text: "Europe/Tirane" },
                    { id: "Europe/Ulyanovsk", text: "Europe/Ulyanovsk" },
                    { id: "Europe/Uzhgorod", text: "Europe/Uzhgorod" },
                    { id: "Europe/Vaduz", text: "Europe/Vaduz" },
                    { id: "Europe/Vatican", text: "Europe/Vatican" },
                    { id: "Europe/Vienna", text: "Europe/Vienna" },
                    { id: "Europe/Vilnius", text: "Europe/Vilnius" },
                    { id: "Europe/Volgograd", text: "Europe/Volgograd" },
                    { id: "Europe/Warsaw", text: "Europe/Warsaw" },
                    { id: "Europe/Zagreb", text: "Europe/Zagreb" },
                    { id: "Europe/Zaporozhye", text: "Europe/Zaporozhye" },
                    { id: "Europe/Zurich", text: "Europe/Zurich" },
                ],
            },
        ];
    }

    render(h) {
        let optArr = this.getOptionList();

        return (
            <DropdownList
                label={!isNullOrEmpty(this.label) ? this.label : "TODO: Casova zona"}
                placeholder={this.placeholder}
                wrap={this.wrap}
                validationState={this.validationState}
                options={optArr}
                mandatory={this.mandatory}
                selected={this.selected == null ? null : { id: this.selected }}
                changed={(e) => {
                    this.changed(e);
                }}
            />
        );
    }
}

export default toNative(TimezonePicker);
