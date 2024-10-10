import { Prop, toNative } from "vue-facing-decorator";
import { GeoJSON } from "../../api/data-contracts/geo";
import TsxComponent, { Component } from "../../app/vuetsx";
import FlexContainer from "../../framework/form/flex-container";
import FlexFormItem from "../../framework/form/form-item-flex";
import FormItemWrapper from "../../framework/form/form-item-wrapper";
import NumericInput, { NumericInputMode } from "../../framework/input/numeric-input";
import OpenStreetMap from "../../framework/open-street-map/open-street-map";
import GeoJsonEditor from "../geo/geo-json";

interface GpsInputArgs {
    gpsModel: { latitude: number; longitude: number; geoJSON?: GeoJSON };
    hasGeoJsonInput?: boolean;
    mandatory?: boolean;
    validationStateLatitude: ValidationState;
    validationStateLongitude: ValidationState;
}

@Component
class GpsInput extends TsxComponent<GpsInputArgs> implements GpsInputArgs {
    @Prop() gpsModel: { latitude: number; longitude: number; geoJSON?: GeoJSON };
    @Prop() hasGeoJsonInput?: boolean;
    @Prop() mandatory?: boolean = true;
    @Prop() validationStateLatitude: ValidationState;
    @Prop() validationStateLongitude: ValidationState;

    onMapInitComplete(leaflet) {
        leaflet?.on("contextmenu", (e) => {
            var coord = e.latlng;
            var lat = coord.lat;
            var lng = coord.lng;
            this.gpsModel.latitude = lat;
            this.gpsModel.longitude = lng;
            this.$nextTick(() => {
                this.$forceUpdate()
            })
        });
    }

    render(h) {
        return (
            <div>
                <FormItemWrapper label={AppState.resources.gpsLabel} mandatory={this.mandatory}>
                    <FlexContainer fullWidthOnMobile={true}>
                        <FlexFormItem flexFill={true}>
                            <NumericInput
                                wrap={false}
                                mandatory={this.mandatory}
                                subtitle={AppState.resources.gpsSubtitle}
                                placeholder={AppState.resources.gpsLatitudeCaption}
                                label={null}
                                value={this.gpsModel.latitude}
                                step={0.000001}
                                mode={NumericInputMode.Clasic}
                                validationState={this.validationStateLatitude}
                                changed={(e) => {
                                    if (e) {
                                        this.gpsModel.latitude = parseFloat(e.toFixed(7));
                                    } else {
                                        this.gpsModel.latitude = null;
                                    }
                                }}
                            />
                        </FlexFormItem>
                        <FlexFormItem flexFill={true}>
                            <NumericInput
                                wrap={false}
                                placeholder={AppState.resources.gpsLongitudeCaption}
                                label={null}
                                value={this.gpsModel.longitude}
                                step={0.000001}
                                mode={NumericInputMode.Clasic}
                                validationState={this.validationStateLongitude}
                                changed={(e) => {
                                    if (e) {
                                        this.gpsModel.longitude = parseFloat(e.toFixed(7));
                                    } else {
                                        this.gpsModel.longitude = null;
                                    }
                                }}
                            />
                        </FlexFormItem>
                    </FlexContainer>
                </FormItemWrapper>

                {this.hasGeoJsonInput && (
                    <GeoJsonEditor
                        value={this.gpsModel.geoJSON}
                        changed={(e) => {
                            this.gpsModel.geoJSON = e;
                        }}
                    />
                )}

                <FormItemWrapper label={null} mandatory={false}>
                    <div class="rounded">
                        <OpenStreetMap
                            ref={"openStreetMap"}
                            latitude={this.gpsModel.latitude != null ? this.gpsModel.latitude.toString() : null}
                            longitude={this.gpsModel.longitude != null ? this.gpsModel.longitude.toString() : null}
                            geoJSON={this.gpsModel.geoJSON}
                            defaultZoom={this.gpsModel.geoJSON != null ? 15 : 12}
                            initComplete={(map) => {
                                this.onMapInitComplete(map);
                            }}
                        />
                    </div>
                </FormItemWrapper>
            </div>
        );
    }
}

export default toNative(GpsInput);
