import { Component, Prop, toNative, Watch } from "vue-facing-decorator";
import TsxComponent from "../../app/vuetsx";
import L from 'leaflet';
import { LMap, LTileLayer, LMarker, LGeoJson, LLayerGroup } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import './css/open-street-map.css';
import * as LCluster from "leaflet.markercluster";

interface OpenStreetMapClusterOptions {
	//A cluster will cover at most this many pixels from its center
	maxClusterRadius?: number
	iconCreateFunction?: any
	clusterPane?: LCluster.Marker.prototype.options.pane
	spiderfyOnEveryZoom?: boolean
	spiderfyOnMaxZoom?: boolean
	showCoverageOnHover?: boolean
	zoomToBoundsOnClick?: boolean
	singleMarkerMode?: boolean
	disableClusteringAtZoom?: any

	// Setting this to false prevents the removal of any clusters outside of the viewpoint, which
	// is the default behaviour for performance reasons.
	removeOutsideVisibleBounds?: boolean

	// Set to false to disable all animations (zoom and spiderfy).
	// If false, option animateAddingMarkers below has no effect.
	// If L.DomUtil.TRANSITION is falsy, this option has no effect.
	animate?: boolean

	//Whether to animate adding markers after adding the MarkerClusterGroup to the map
	// If you are adding individual markers set to true, if adding bulk markers leave false for massive performance gains.
	animateAddingMarkers?: boolean

	// Make it possible to provide custom function to calculate spiderfy shape positions
	spiderfyShapePositions?: any

	//Increase to increase the distance away that spiderfied markers appear from the center
	spiderfyDistanceMultiplier?: number

	// Make it possible to specify a polyline options on a spider leg
	spiderLegPolylineOptions?: any

	// When bulk adding layers, adds markers in chunks. Means addLayers may not add all the layers in the call, others will be loaded during setTimeouts
	chunkedLoading?: boolean
	chunkInterval?: number // process markers for a maximum of ~ n milliseconds (then trigger the chunkProgress callback)
	chunkDelay?: number // at the end of each interval, give n milliseconds back to system/browser
	chunkProgress?: any // progress callback: function(processed, total, elapsed) (e.g. for a progress indicator)

	//Options to pass to the L.Polygon constructor
	polygonOptions?: any
}

interface OpenStreetMapArgs {
    latitude?: string
    longitude?: string
    name?: string
    address?: string
    is16by9?: boolean
    defaultZoom?: number
	maxZoom?: number
	isCenterHidden?: boolean
    geoJSON?: any
	geoJSONConfig?: any
	clusterOptions?: OpenStreetMapClusterOptions
	geoJSONClustering?: boolean
    initComplete?: (map: any, GMaps: any) => void
}

export class OpenStreetMapHelper {
	static getMarkerIcon(): L.Icon<L.IconOptions> {
		return L.icon({
			iconUrl: "/assets/img/marker-icon.png",
			iconAnchor:  [12, 41],
			popupAnchor: [1, -34],
			tooltipAnchor: [16, -28],
			shadowSize:  [41, 41]
		});
	}
}

export interface GoogleMapRefreshArgs {
    autoCenter?: boolean
}

@Component({
    components: {
        'l-map': LMap,
        'l-tile-layer': LTileLayer,
        'l-marker': LMarker,
        'l-geo-json': LGeoJson,
		'l-layer-group': LLayerGroup
    }
})
export class OpenStreetMap extends TsxComponent<OpenStreetMapArgs> implements OpenStreetMapArgs {
    @Prop() latitude!: string;
    @Prop() longitude!: string;
    @Prop() name!: string;
    @Prop() address!: string;
    @Prop() is16by9!: boolean
    @Prop() defaultZoom?: number
	@Prop({ default: 18 }) maxZoom?: number
	@Prop() isCenterHidden!: boolean
    @Prop() geoJSON?: any
	@Prop() geoJSONConfig?: any
	@Prop() clusterOptions?: OpenStreetMapClusterOptions
	@Prop() geoJSONClustering?: boolean
    @Prop() initComplete?: (map: any, mapHandler: any) => void
    leafletIcon: any = null
	markerClusters: LCluster.MarkerClusterGroup = null

    mounted() {
        this.initIcon();
        this.invalidateSize();
        this.$nextTick(() => {
            this.$nextTick(() => {
                if (this.initComplete != null) {
                    this.initComplete(this.getLeaflet(), this.getMap());
                }
            });
        });
    }

    initIcon() {
        if (this.leafletIcon == null) {
            this.leafletIcon = OpenStreetMapHelper.getMarkerIcon();
        }
    }

	@Watch('geoJSON')
	onGeoJsonChanged() {
		if (this.geoJSONClustering) {
			this.initCluster();
		}
	}

	initCluster() {
		this.markerClusters?.clearLayers();
		this.markerClusters = new LCluster.MarkerClusterGroup(this.clusterOptions || {
			iconCreateFunction: function(cluster) {
				const html = '<div class="cluster-marker ">' + cluster.getChildCount() + '<div class="pulse-animation"></div></div>';
				return L.divIcon({ html: html, className: 'cluster-icon' });
			},
			animate: true,
		});

		if (this.markerClusters != null && !isNullOrEmpty(this.geoJSON)) {
			for (const json of this.geoJSON) {
				const geoJsonLayer = L.geoJson(json, this.geoJSONConfig);
				this.markerClusters.addLayer(geoJsonLayer);
			}

			this.getLeaflet().addLayer(this.markerClusters);
			this.getLeaflet().fitBounds(this.markerClusters.getBounds());
		}
	}

    updated() {
        this.invalidateSize();
    }

    invalidateSize() {
        const leaflet = this.getLeaflet();
        if (leaflet != null) {
            this.$nextTick(() => {
                leaflet.invalidateSize();
            });

            setTimeout(() => {
                leaflet.invalidateSize();
            }, 400);
        }
    }

    getNumeric(val: string): number {
        return Number((val || '').toString().split(',').join(''));
    }

    getZoomValue(): number {
        if (this.defaultZoom != null) {
            return this.defaultZoom;
        } else {
            return 16;
        }
    }

    getLocPoint() {
        return {
            lat: this.getNumeric(this.latitude),
            lng: this.getNumeric(this.longitude)
        };
    }

    getLocArr() {
        return [
            this.getNumeric(this.latitude),
            this.getNumeric(this.longitude)
        ]
    }

    getMap() {
        return this.$refs.mainMap;
    }

    getLeaflet() {
        return (this.getMap() as any)?.leafletObject;
    }

    render(h) {
        if (this.is16by9 == false) {
            return this.renderLeaflet(h, { height: "100%" });
        }

        return (
            <div style="width: 100%;position: relative;padding-top: 56.25%;">
                {this.renderLeaflet(h, {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                })}
            </div>
        )
    }

    private renderLeaflet(h, style: object) {
        const locArr = this.getLocArr();

        return (
            <l-map style={style} zoom={this.getZoomValue()} maxZoom={this.maxZoom} center={locArr} ref="mainMap">
                <l-tile-layer url={'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'} attribution={'&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors'}></l-tile-layer>
				{!this.isCenterHidden &&
					<l-marker lat-lng={locArr} icon={this.leafletIcon}></l-marker>
				}

                {!isNullOrEmpty(this.geoJSON) &&
					<l-geo-json ref="geoJson" options={this.geoJSONConfig != null && this.geoJSONConfig} geojson={this.geoJSONClustering ? [] : this.geoJSON}></l-geo-json>
                }

				{this.$slots.default?.()}
            </l-map >
        )
    }
}

export default toNative(OpenStreetMap)
