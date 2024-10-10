import { Prop, toNative } from "vue-facing-decorator";
import { PERMISSION } from "../../api/data-contracts/enums";
import TsxComponent, { Component } from "../../app/vuetsx";
import DropdownList, { DropdownListOption } from "../../framework/dropdown";
import CheckBox from "../../framework/input/checkbox";
import PermissionUtil from "../../utils/permissionUtil";

export class CountryModel {
    id: number = null;
    text: string = null;
}

interface PermissionPickerArgs {
    mandatory?: boolean;
    selected: PERMISSION[];
    label?: string;
    validationState?: ValidationState;
    showSelectAll?: boolean;
    wrap?: boolean;
    changed: (e: PERMISSION[]) => void;
}

@Component
class PermissionPicker extends TsxComponent<PermissionPickerArgs> implements PermissionPickerArgs {
    @Prop() mandatory!: boolean;
    @Prop() selected: PERMISSION[];
    @Prop() label!: string;
    @Prop() showSelectAll?: boolean;
    @Prop() wrap!: boolean;
    @Prop() changed: (e: PERMISSION[]) => void;

    getOptions(): DropdownListOption[] {
        // It should not be static
        const retVal = [
            { id: "SUPER_ADMIN", text: "SUPER_ADMIN" },
            { id: "ADMIN", text: "ADMIN" },
            { id: "USER_CREATE", text: "USER_CREATE" },
            { id: "USER_EDIT", text: "USER_EDIT" },
            { id: "USER_DELETE", text: "USER_DELETE" },
            { id: "USER_LIST", text: "USER_LIST" },
            { id: "RESORT_READ", text: "RESORT_READ" },
            { id: "RESORT_WRITE", text: "RESORT_WRITE" },
            { id: "SKILIFT_READ", text: "SKILIFT_READ" },
            { id: "SKILIFT_WRITE", text: "SKILIFT_WRITE" },
            { id: "SLOPE_READ", text: "SLOPE_READ" },
            { id: "SLOPE_WRITE", text: "SLOPE_WRITE" },
            { id: "BIKE_READ", text: "BIKE_READ" },
            { id: "BIKE_WRITE", text: "BIKE_WRITE" },
            { id: "CROSS_COUNTRY_READ", text: "CROSS_COUNTRY_READ" },
            { id: "CROSS_COUNTRY_WRITE", text: "CROSS_COUNTRY_WRITE" },
            { id: "PRICE_PRODUCT_READ", text: "PRICE_PRODUCT_READ" },
            { id: "PRICE_PRODUCT_WRITE", text: "PRICE_PRODUCT_WRITE" },
            { id: "THEME_PARK_READ", text: "THEME_PARK_READ" },
            { id: "THEME_PARK_WRITE", text: "THEME_PARK_WRITE" },
            { id: "AQUAPARK_POOL_READ", text: "AQUAPARK_POOL_READ" },
            { id: "AQUAPARK_POOL_WRITE", text: "AQUAPARK_POOL_WRITE" },
            { id: "AQUAPARK_ATTRACTION_READ", text: "AQUAPARK_ATTRACTION_READ" },
            { id: "AQUAPARK_ATTRACTION_WRITE", text: "AQUAPARK_ATTRACTION_WRITE" },
            { id: "SERVICE_READ", text: "SERVICE_READ" },
            { id: "SERVICE_WRITE", text: "SERVICE_WRITE" },
            { id: "ACCOMMODATION_READ", text: "ACCOMMODATION_READ" },
            { id: "ACCOMMODATION_WRITE", text: "ACCOMMODATION_WRITE" },
            { id: "RESTAURANT_READ", text: "RESTAURANT_READ" },
            { id: "RESTAURANT_WRITE", text: "RESTAURANT_WRITE" },
            { id: "FEED_READ", text: "FEED_READ" },
            { id: "FEED_FILTER_READ", text: "FEED_FILTER_READ" },
            { id: "FEED_FILTER_WRITE", text: "FEED_FILTER_WRITE" },
            { id: "RECOMMENDATION_READ", text: "RECOMMENDATION_READ" },
            { id: "RECOMMENDATION_WRITE", text: "RECOMMENDATION_WRITE" },
            { id: "EVENT_READ", text: "EVENT_READ" },
            { id: "EVENT_WRITE", text: "EVENT_WRITE" },
            { id: "PRODUCT_WRITE", text: "PRODUCT_WRITE" },
            { id: "PRODUCT_READ", text: "PRODUCT_READ" },
            { id: "CAMERA_READ", text: "CAMERA_READ" },
            { id: "CAMERA_WRITE", text: "CAMERA_WRITE" },
            { id: "DEPARTURE_READ", text: "DEPARTURE_READ" },
            { id: "DEPARTURE_WRITE", text: "DEPARTURE_WRITE" },
            { id: "INFO_READ", text: "INFO_READ" },
            { id: "INFO_WRITE", text: "INFO_WRITE" },
            { id: "WEATHER_READ", text: "WEATHER_READ" },
            { id: "WEATHER_WRITE", text: "WEATHER_WRITE" },
            { id: "PARKING_READ", text: "PARKING_READ" },
            { id: "PARKING_WRITE", text: "PARKING_WRITE" },
            { id: "ACCESSORY_WRITE", text: "ACCESSORY_WRITE" },
            { id: "LOCATION_WRITE", text: "LOCATION_WRITE" },
            { id: "LOCATION_READ", text: "LOCATION_READ" },
            { id: "TAG_WRITE", text: "TAG_WRITE" },
            { id: "TAG_READ", text: "TAG-READ" },
            { id: "GOPASS_BENEFITS_WRITE", text: "GOPASS_BENEFITS_WRITE" },
            { id: "GOPASS_BENEFITS_READ", text: "GOPASS_BENEFITS_READ" },
            { id: "LOG_READ", text: "LOG_READ" },
            { id: "CROSS_SALE_PRODUCT_WRITE", text: "CROSS_SALE_PRODUCT_WRITE" },
            { id: "CROSS_SALE_PRODUCT_READ", text: "CROSS_SALE_PRODUCT_READ" },
            { id: "FLOW_MEASUREMENT_READ", text: "FLOW_MEASUREMENT_READ" },
        ];

        if (!PermissionUtil.hasPermission(PERMISSION.SUPER_ADMIN)) {
            retVal.shift();
        }

        return retVal;
    }

    render(h) {
        const options = this.getOptions();

        return (
            <div class="permission-picker-root">
                {this.showSelectAll != false && (
                    <CheckBox
                        wrap={false}
                        label={null}
                        checkboxLabelHtml={null}
                        value={(this.selected || []).length == options.length}
                        changed={(selectAll) => {
                            if (selectAll) {
                                this.changed(options.map((p) => p.id as PERMISSION));
                            } else {
                                this.changed([]);
                            }
                        }}
                    />
                )}

                {options.map((perm) => (
                    <CheckBox
                        wrap={false}
                        label={null}
                        checkboxLabelHtml={perm.text}
                        value={(this.selected || []).contains(perm.id as PERMISSION)}
                        changed={(shouldAdd) => {
                            const newArr = (this.selected || []).clone();
                            if (shouldAdd) {
                                const existing = newArr.find((p) => p == (perm.id as PERMISSION));
                                if (existing == null) {
                                    newArr.push(perm.id as PERMISSION);
                                }
                            } else {
                                const existing = newArr.find((p) => p == (perm.id as PERMISSION));
                                if (existing != null) {
                                    newArr.remove(perm.id as PERMISSION);
                                }
                            }

                            this.changed(newArr);
                        }}
                    />
                ))}
            </div>
        );
    }
}

export default toNative(PermissionPicker);
