export class GeoJSON {
    geometry: GeoGeometry = null;
    properties: GeoProperties = null;
    type: string;
}

export class GeoGeometry {
    coordinates: number[][] = null;
    type: string = null;
}

export class GeoProperties {
    "stroke-opacity": number = null;
    "stroke-width": number = null;
    MarkerLocation?: number[] = null;
    label: string = null;
    stroke: string = null;
}
