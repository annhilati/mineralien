"use client";

import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Map, MapRef } from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';

import 'maplibre-gl/dist/maplibre-gl.css';

import { MapConfig } from '../map_engine/types';
import { useMapStyle } from '../map_engine/hooks/useMapStyle';

import './TacticalMap.scss'

import { localGlyphProtocol } from '../map_engine/localGlyphs';

// Workaround für Next.js (App Router / Webpack) Worker-Ladeprobleme
if (typeof window !== 'undefined') {
    const ml = maplibregl as any;
    if (typeof ml.setWorkerUrl === 'function') {
        ml.setWorkerUrl('https://unpkg.com/maplibre-gl@6.2.0/dist/maplibre-gl-worker.mjs');
    } else {
        ml['workerUrl'] = 'https://unpkg.com/maplibre-gl@6.2.0/dist/maplibre-gl-worker.mjs';
    }
    
    // Protokoll für lokales Font-Rendering registrieren (On-The-Fly Generierung)
    if (!ml._localGlyphsRegistered) {
        ml.addProtocol('local', localGlyphProtocol);
        ml._localGlyphsRegistered = true;
    }
}

export const DARK_SCHEMATIC_MAP_CONFIG: MapConfig = {
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
        water: 'hsl(353, 18%, 15%)',
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

export const TACTICAL_SATELLITE_CONFIG: MapConfig = {
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
        forest: 'rgba(18, 36, 20, 0.3)',           
        grass: 'rgba(0,0,0,0)',
        crop: 'rgba(0,0,0,0)',
        glacier: 'rgba(0,0,0,0)',
        residential: 'rgba(0,0,0,0)',
        national_park: 'rgba(0,0,0,0)',
        water: 'hsla(217, 65%, 5%, 0.65)', 
        waterway: '#000000',
        buildings: '#000000',
        contours: 'rgba(255, 255, 255, 0.8)',
        paths: 'rgb(from var(--gelb) r g b / 0.0)',
        boundaries: 'var(--orange)', // Weiße Grenzen
        hillshade: '#000000',
        satelliteTint: 'rgba(20, 45, 85, 0.25)'
    },
    textOverrides: {
        'place_country': { // Greift für 'place_country_major' und 'place_country_other'
            color: 'var(--weiss)',
            haloColor: 'rgba(0,0,0,0.8)',
            haloWidth: 1.5,
            size: 18,
            font: ['var(--font-title) Bold']
        },
        "place_state": {
            color: 'var(--weiss)',
            haloColor: 'rgba(0,0,0,0.0)',
            size: 12,
            font: ['var(--font-title)']
        },
        "place_city": {
            color: 'var(--weiss)',
            haloColor: 'rgba(0,0,0,0.0)',
            font: ['var(--font-heading) Bold']
        },
        "place_town": {
            color: 'var(--weiss)',
            haloColor: 'rgba(0,0,0,0.0)',
        },
        "place_village": {
            color: 'var(--weiss)',
            haloColor: 'rgba(0,0,0,0.0)',
        },
        "place_suburb": {
            color: 'var(--weiss)',
            haloColor: 'rgba(0,0,0,0.0)',
        },
        "watername": { // Greift für Seen, Meere, Ozeane
            color: 'var(--weiss)',
            haloColor: 'rgba(0,0,0,0.0)',
            font: ['var(--font-text)']
        },
        "waterway": { // Greift für Flüsse, Kanäle, Bäche (Elbe, Gräben etc.)
            color: 'var(--weiss)',
            haloColor: 'rgba(0,0,0,0.0)',
            font: ['var(--font-text)']
        }
    }
};

export interface TacticalMapRef {
    flyTo: (options: { center: [number, number]; zoom?: number; duration?: number; essential?: boolean }) => void;
}

interface TacticalMapProps {
    fixed?: boolean;
    center?: { longitude: number; latitude: number };
    zoom?: number;
    children?: React.ReactNode;
    variant?: 'satellite' | 'schematic';
}

const TacticalMap = forwardRef<TacticalMapRef, TacticalMapProps>(({ fixed = false, center, zoom, children, variant = 'satellite' }, ref) => {
    const mapRef = useRef<MapRef>(null);
    
    const config = variant === 'schematic' ? DARK_SCHEMATIC_MAP_CONFIG : TACTICAL_SATELLITE_CONFIG;
    
    // 1. Modulares Styling laden
    const mapStyle = useMapStyle(config);
    const [isLoaded, setIsLoaded] = useState(false);

    // 2. Initialen View State bestimmen (Props überschreiben Config)
    const initialViewState = {
        ...config.initialViewState,
        ...(center ? { longitude: center.longitude, latitude: center.latitude } : {}),
        ...(zoom !== undefined ? { zoom } : {})
    };

    const [zoomState, setZoom] = useState(initialViewState.zoom);

    useImperativeHandle(ref, () => ({
        flyTo: (options) => {
            if (mapRef.current) {
                mapRef.current.flyTo(options);
            }
        }
    }));

    if (!mapStyle) {
        return <div style={{ display: 'flex', width: '100%', height: '100%' }}/>;
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <Map
                ref={mapRef}
                mapLib={maplibregl}
                initialViewState={initialViewState}
                mapStyle={mapStyle}
                maxZoom={18}
                minZoom={0.8}
                onMove={(e) => setZoom(e.viewState.zoom)}
                onLoad={() => setIsLoaded(true)}
                style={{ 
                    width: '100%', 
                    height: '100%',
                    opacity: isLoaded ? 1 : 0,
                    transition: 'opacity 0.5s ease-in-out'
                }}
                attributionControl={false}
                dragRotate={false}       // Kein Kippen
                pitchWithRotate={false}  // Kein Kippen
                dragPan={!fixed}
                scrollZoom={!fixed}
                doubleClickZoom={!fixed}
                touchZoomRotate={!fixed} // Deaktiviert Pinch-to-Zoom auf Touchscreens
            >
                {children}
            </Map>
        </div>
    );
});

TacticalMap.displayName = 'TacticalMap';

export default TacticalMap;
