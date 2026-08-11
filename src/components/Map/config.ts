export interface MapFeatures {
    enable3DTerrain?: boolean;
    enableHillshade?: boolean;
    enableContours?: boolean;
    enableCustomColors?: boolean;
    enableSatelliteBasemap?: boolean;
    freezeColorsAtZoom?: number | null;
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
}

export const MAP_CONFIG: MapConfig = {
    initialViewState: {
        longitude: 12.36345,
        latitude: 47.20186,
        zoom: 17,
        pitch: 60,
        bearing: 0
    },
    baseStyleUrl: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    
    // Feature Toggles für die modulare Architektur
    features: {
        enable3DTerrain: true,
        enableHillshade: true,
        enableContours: true,
        enableCustomColors: true,
        freezeColorsAtZoom: 13,
    },

    terrainUrl: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
    terrainMaxZoom: 12,
    terrainEncoding: 'terrarium',
    terrainExaggeration: 1.2,
    hillshadeExaggeration: 0.45,
    contourThresholds: {
        11: [600, 300],
        12: [300, 150],
        14: [150, 30]
    },
    customColors: {
        background: '#d1cbc2',
        forest: '#748c68',
        grass: '#94c480',
        crop: '#ded59b',
        glacier: '#b8f5ff',
        residential: '#ebb29d',
        national_park: '#bee8a9',
        water: '#65a4bf',
        waterway: '#65a4bf',
        buildings: '#9e836d',
        contours: '#637555',
        paths: '#ffffff' // Helle Pfade
    },
    minZoomOverrides: {
        paths: 11.5
    }
};

export const DARK_MAP_CONFIG: MapConfig = {
    initialViewState: {
        longitude: 12.36345,
        latitude: 47.20186,
        zoom: 12,
        pitch: 0,
        bearing: 0
    },
    baseStyleUrl: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    
    features: {
        enable3DTerrain: false,
        enableHillshade: true,
        enableContours: true,
        enableCustomColors: true,
        freezeColorsAtZoom: null,
    },

    terrainUrl: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
    terrainMaxZoom: 12,
    terrainEncoding: 'terrarium',
    hillshadeExaggeration: 0.15,
    contourThresholds: {
        11: [600, 300],
        12: [300, 150],
        14: [150, 30]
    },

    customColors: {
        background: '#222026', 
        forest: '#232029',                 
        grass: '#2d2936',                    
        crop: '#1c1a20',                     
        glacier: '#232029',                
        residential: '#232029',        
        national_park: '#1c1a20',    
        water: '#301b1f',
        waterway: '#401019',     
        buildings: 'var(--fuchsia)',      
        contours: 'var(--rot)',  
        paths: '#a34154',
        hillshade: '#080709'
    },
    minZoomOverrides: {
        paths: 4.5
    }
};

export const SATELLITE_CONFIG: MapConfig = {
    initialViewState: {
        longitude: 12.36345,
        latitude: 47.20186,
        zoom: 12,
        pitch: 0,
        bearing: 0
    },
    baseStyleUrl: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    
    features: {
        enable3DTerrain: false,
        enableHillshade: true,
        enableContours: true,
        enableCustomColors: true,
        enableSatelliteBasemap: true,
        freezeColorsAtZoom: null,
    },

    terrainUrl: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
    terrainMaxZoom: 12,
    terrainEncoding: 'terrarium',
    hillshadeExaggeration: 0.25, // Nur ein sanfter "Hint" für die Berge
    contourThresholds: {
        11: [600, 300],
        12: [300, 150],
        14: [150, 30]
    },

    customColors: {
        background: '#000000',
        forest: 'rgba(29, 46, 20, 0.3)', // Experimenteller olivgrüner Overlay, um ca. #181f07 zu erreichen                
        grass: 'rgba(0,0,0,0)',
        crop: 'rgba(0,0,0,0)',
        glacier: 'rgba(0,0,0,0)',
        residential: 'rgba(0,0,0,0)',
        national_park: 'rgba(0,0,0,0)',
        water: 'rgba(10, 20, 35, 0.65)', // Halbtransparentes Dunkelblau, das mit dem grauen Satellitenbild ca. #212630 ergibt
        waterway: '#000000',
        buildings: '#000000',
        contours: 'rgba(255, 255, 255, 0.8)',
        paths: 'rgb(from var(--gelb) r g b / 0.0)',
        boundaries: 'rgb(from var(--fuchsia) r g b / 0.2)', // Fuchsia (#f54a7d) mit Transparenz, damit es sich abhebt
        hillshade: '#000000',
        satelliteTint: 'rgba(20, 45, 85, 0.25)'
    }
};
