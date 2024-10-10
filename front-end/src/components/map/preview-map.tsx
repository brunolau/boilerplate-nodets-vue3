import { Prop, toNative } from "vue-facing-decorator";
import { GeoJSON } from "../../api/data-contracts/geo";
import { TsxComponentExtended } from "../../app/vuestsx-extended";
import FormItemWrapper from "../../framework/form/form-item-wrapper";
import GoogleMap from "../../framework/google/maps";
import "./css/preview-map.css";
import { Component } from "../../app/vuetsx";

interface PreviewMapArgs {
    name: string;
    latitude: number;
    longitude: number;
    geoJSON?: GeoJSON;
    mandatory?: boolean;
    label?: string;
    validationState?: ValidationState;
    wrap?: boolean;
}

@Component
class PreviewMap extends TsxComponentExtended<PreviewMapArgs> implements PreviewMapArgs {
    @Prop() name: string;
    @Prop() latitude!: number;
    @Prop() longitude!: number;
    @Prop() geoJSON?: GeoJSON;
    @Prop() mandatory!: boolean;
    @Prop() label!: string;
    @Prop() validationState!: ValidationState;
    @Prop() wrap!: boolean;

    updated() {
        const googleMap = this.getGoogleMap();
        if (googleMap != null) {
            googleMap.refreshMapItems();
        }
    }

    getGoogleMap() {
        return this.$refs.googleMap as typeof GoogleMap.prototype;
    }

    render(h) {
        return (
            <FormItemWrapper wrap={this.wrap} label={this.label} mandatory={this.mandatory} validationState={this.validationState}>
                <div class="location-preview-map">
                    <GoogleMap
                        ref={"googleMap"}
                        geoJSON={this.geoJSON}
                        latitude={(this.latitude != null ? this.latitude : 0).toString()}
                        longitude={(this.longitude != null ? this.longitude : 0).toString()}
                        defaultZoom={this.geoJSON != null ? 15 : 12}
                    />
                </div>
            </FormItemWrapper>
        );
    }
}

export default toNative(PreviewMap);
