"use client";

import { useState } from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as maplibregl from 'maplibre-gl';

// Workaround für Next.js (App Router / Webpack) Worker-Ladeprobleme
if (typeof window !== 'undefined') {
    if (typeof (maplibregl as any).setWorkerUrl === 'function') {
        (maplibregl as any).setWorkerUrl('https://unpkg.com/maplibre-gl@6.2.0/dist/maplibre-gl-worker.mjs');
    } else {
        (maplibregl as any).workerUrl = 'https://unpkg.com/maplibre-gl@6.2.0/dist/maplibre-gl-worker.mjs';
    }
}

import { DARK_MAP_CONFIG } from './config';
import { useMapStyle } from './hooks/useMapStyle';

interface DarkMiniMapProps {
    fixed?: boolean;
    center?: { longitude: number; latitude: number };
    zoom?: number;
}

export default function DarkMiniMap({ fixed = false, center, zoom }: DarkMiniMapProps) {
    // 1. Modulares Styling laden mit unserer neuen Dark Config
    const mapStyle = useMapStyle(DARK_MAP_CONFIG);
    
    // ViewState aus Config mit übergebenen Props mergen
    const initialViewState = {
        ...DARK_MAP_CONFIG.initialViewState,
        ...(center ? { longitude: center.longitude, latitude: center.latitude } : {}),
        ...(zoom !== undefined ? { zoom } : {})
    };

    const [zoomState, setZoom] = useState(initialViewState.zoom);

    if (!mapStyle) {
        return (
            <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--fuchsia)' }}>
                Lade Dark Map...
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <Map
                mapLib={maplibregl}
                initialViewState={initialViewState}
                mapStyle={mapStyle}
                maxZoom={18}
                minZoom={0.8}
                onMove={(e) => setZoom(e.viewState.zoom)}
                style={{ width: '100%', height: '100%' }}
                attributionControl={false}
                dragRotate={false}       // Kein Kippen
                pitchWithRotate={false}  // Kein Kippen
                dragPan={!fixed}
                scrollZoom={!fixed}
                doubleClickZoom={!fixed}
                touchZoomRotate={!fixed} // Deaktiviert Pinch-to-Zoom auf Touchscreens
            >
                {/* Marker im Akzent-Design */}
                {/* <Marker longitude={12.3481} latitude={47.2734} anchor="bottom">
                    <div style={{
                        backgroundColor: 'var(--rot)',
                        color: 'var(--weiss)',
                        padding: '5px 10px',
                        borderRadius: '20px',
                        border: '2px solid var(--fuchsia)',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}>
                        📍 Akzent Marker
                    </div>
                </Marker> */}
            </Map>
        </div>
    );
}
