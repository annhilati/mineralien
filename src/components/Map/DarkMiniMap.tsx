"use client";

import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Map, MapRef } from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';

import 'maplibre-gl/dist/maplibre-gl.css';
import './DarkMiniMap.scss'

// Workaround für Next.js (App Router / Webpack) Worker-Ladeprobleme
if (typeof window !== 'undefined') {
    if (typeof (maplibregl as any).setWorkerUrl === 'function') {
        (maplibregl as any).setWorkerUrl('https://unpkg.com/maplibre-gl@6.2.0/dist/maplibre-gl-worker.mjs');
    } else {
        (maplibregl as any).workerUrl = 'https://unpkg.com/maplibre-gl@6.2.0/dist/maplibre-gl-worker.mjs';
    }
}

import { DARK_MAP_CONFIG, SATELLITE_CONFIG } from './config';
import { useMapStyle } from './hooks/useMapStyle';

export interface DarkMiniMapRef {
    flyTo: (options: { center: [number, number]; zoom?: number; duration?: number; essential?: boolean }) => void;
}

interface DarkMiniMapProps {
    fixed?: boolean;
    center?: { longitude: number; latitude: number };
    zoom?: number;
    children?: React.ReactNode;
    variant?: 'satellite' | 'schematic';
}

const DarkMiniMap = forwardRef<DarkMiniMapRef, DarkMiniMapProps>(({ fixed = false, center, zoom, children, variant = 'satellite' }, ref) => {
    const mapRef = useRef<MapRef>(null);
    
    const config = variant === 'schematic' ? DARK_MAP_CONFIG : SATELLITE_CONFIG;
    
    // 1. Modulares Styling laden
    const mapStyle = useMapStyle(config);
    
    // ViewState aus Config mit übergebenen Props mergen
    const initialViewState = {
        ...config.initialViewState,
        ...(center ? { longitude: center.longitude, latitude: center.latitude } : {}),
        ...(zoom !== undefined ? { zoom } : {})
    };

    const [zoomState, setZoom] = useState(initialViewState.zoom);
    const [isLoaded, setIsLoaded] = useState(false);
    
    useImperativeHandle(ref, () => ({
        flyTo: (options) => {
            mapRef.current?.flyTo(options);
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

export default DarkMiniMap;
