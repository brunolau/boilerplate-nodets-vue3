import { toNative, Prop } from "vue-facing-decorator";
import TsxComponent, { Component } from "../../app/vuetsx";
import GoogleMapsApiLoader from "./ts/google-maps-api";

interface GoogleMapArgs {
    latitude?: string;
    longitude?: string;
    name?: string;
    address?: string;
    is16by9?: boolean;
    defaultZoom?: number;
    geoJSON?: any;
    initComplete?: (map: any, GMaps: any) => void;
}

export interface GoogleMapRefreshArgs {
    autoCenter?: boolean;
}

@Component
class GoogleMap extends TsxComponent<GoogleMapArgs> implements GoogleMapArgs {
    @Prop() latitude!: string;
    @Prop() longitude!: string;
    @Prop() name!: string;
    @Prop() address!: string;
    @Prop() is16by9!: boolean;
    @Prop() defaultZoom?: number;
    @Prop() geoJSON?: any;
    @Prop() initComplete?: (map: any, GMaps: any) => void;
    map: any;
    infoWindow: any;
    marker: any;
    lastState: any;

    getNumeric(val: string): number {
        return Number((val || "").toString().split(",").join(""));
    }

    getLocPoint() {
        if (window["google"]?.maps?.LatLng) {
            return new window["google"].maps.LatLng(this.latitude, this.longitude);
        }

        return {
            lat: this.getNumeric(this.latitude),
            lng: this.getNumeric(this.longitude),
        };
    }

    mounted() {
        var mySelf = this;
        (window as any).mapInst = mySelf;

        GoogleMapsApiLoader.load().then((result) => {
            if (result) {
                let gmapArgs: any = {
                    center: mySelf.getLocPoint(),
                };

                if (this.defaultZoom > 0) {
                    gmapArgs.zoom = this.defaultZoom;
                } else {
                    gmapArgs.zoom = 16;
                }

                mySelf.map = new window["google"].maps.Map(mySelf.$refs.mapWrapper, gmapArgs);
                mySelf.refreshMapItems.call(mySelf);
                (window as any).mapInstance = mySelf.map;

                if (this.initComplete != null) {
                    this.initComplete(mySelf.map, window["google"].maps);
                }
            }
        });
    }

    updated() {
        this.refreshMapItems();
    }

    getCurrentState() {
        return {
            lat: this.latitude,
            lon: this.longitude,
            geoJSON: this.geoJSON,
        };
    }

    refreshMapItems(args?: GoogleMapRefreshArgs) {
        var map = this.map;
        var locPoint = this.getLocPoint();
        var newState = this.getCurrentState();

        if (this.lastState != null && JSON.stringify(newState) == JSON.stringify(this.lastState)) {
            return;
        }

        if (this.lastState != null && args?.autoCenter != false) {
            map.setCenter(locPoint);
        }

        if (this.infoWindow == null && !isNullOrEmpty(this.name)) {
            this.infoWindow = new window["google"].maps.InfoWindow({
                content: "",
            });
        }

        if (this.marker != null) {
            this.marker.setMap(null);
            this.marker = null;
        }

        if (this.marker == null) {
            this.marker = new window["google"].maps.Marker({
                position: locPoint,
                title: portalUtils.htmlEscape(this.name),
                visible: true,
            });

            this.marker.addListener("click", () => {
                this.infoWindow.open(map, this.marker);
            });
        }

        this.marker.position = locPoint;
        this.marker.title = portalUtils.htmlEscape(this.name);
        this.marker.setMap(map);

        if (this.infoWindow != null) {
            this.infoWindow.setContent("<b>" + portalUtils.htmlEscape(this.name) + "</b><br> " + portalUtils.htmlEscape(this.address));
            this.infoWindow.open(map, this.marker);
        }

        if (!isNullOrEmpty(this.geoJSON)) {
            map.data.addGeoJson(this.geoJSON);
        }

        this.lastState = this.getCurrentState();
    }

    render(h) {
        if (this.is16by9 == false) {
            return <div class="google-map-wrapper" ref="mapWrapper"></div>;
        }

        return (
            <div style="width: 100%;position: relative;padding-top: 56.25%;">
                <div class="rounded" style="position: absolute; top: 0;left: 0; bottom: 0;right: 0;" ref="mapWrapper"></div>
            </div>
        );
    }
}

export default toNative(GoogleMap);
