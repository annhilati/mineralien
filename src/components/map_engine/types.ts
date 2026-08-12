export interface MapFeatures {
    enable3DTerrain?: boolean;
    enableHillshade?: boolean;
    enableContours?: boolean;
    enableCustomColors?: boolean;
    enableSatelliteBasemap?: boolean;
    freezeColorsAtZoom?: number | null;
}

export interface TextOverride {
    color?: string;
    haloColor?: string;
    haloWidth?: number;
    size?: number;
    font?: string[];
}

export interface MapConfig {
    initialViewState: {
        longitude: number;
        latitude: number;
        zoom: number;
        pitch: number;
        bearing: number;
    };
    baseStyleUrl: string;
    features: MapFeatures;
    terrainUrl?: string;
    terrainMaxZoom?: number;
    terrainEncoding?: 'terrarium' | 'mapbox';
    terrainExaggeration?: number;
    hillshadeExaggeration?: number;
    contourThresholds?: Record<number, number[]>;
    customColors?: {
        background: string;
        forest: string;
        grass: string;
        crop: string;
        glacier: string;
        residential: string;
        national_park: string;
        water: string;
        waterway: string;
        buildings: string;
        contours?: string;
        paths?: string;
        boundaries?: string;
        hillshade?: string;
        satelliteTint?: string;
    };
    minZoomOverrides?: {
        paths?: number;
    };
    textOverrides?: Record<string, TextOverride>;
}
