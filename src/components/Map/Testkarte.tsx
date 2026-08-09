"use client";

import { useState } from 'react';
import Map, { NavigationControl, Marker } from 'react-map-gl/maplibre';
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

import { MAP_CONFIG } from './config';
import { useMapStyle } from './hooks/useMapStyle';
import { useMapContextMenu } from './hooks/useMapContextMenu';
import { MapContextMenu } from './MapContextMenu';

export default function Testkarte() {
    // 1. Modulares Styling laden (Dependency Injection via Config)
    const mapStyle = useMapStyle(MAP_CONFIG);
    
    // 2. Modulares Kontextmenü laden
    const { contextMenu, handleContextMenu, closeContextMenu } = useMapContextMenu();
    
    const [zoom, setZoom] = useState(MAP_CONFIG.initialViewState.zoom);

    if (!mapStyle) {
        return (
            <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                Lade Map-Style...
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
            <Map
                mapLib={maplibregl}
                initialViewState={MAP_CONFIG.initialViewState}
                mapStyle={mapStyle}
                maxZoom={18}
                minZoom={0.8}
                onMove={(e) => setZoom(e.viewState.zoom)}
                onContextMenu={handleContextMenu}
                onClick={closeContextMenu}
                onDragStart={closeContextMenu}
                style={{ width: '100%', height: '100%' }}
                attributionControl={false}
            >
                <NavigationControl position="top-right" visualizePitch={true} />
                <Marker longitude={12.3481} latitude={47.2734} anchor="bottom">
                    <div style={{
                        backgroundColor: 'var(--bg-primary)',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '20px',
                        border: '2px solid white',
                        cursor: 'pointer'
                    }}>
                        📍 Fundort 1
                    </div>
                </Marker>
            </Map>
            
            <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '5px 10px', borderRadius: 4, zIndex: 10 }}>
                Zoom: {zoom.toFixed(2)}
            </div>

            {contextMenu && (
                <MapContextMenu 
                    data={contextMenu} 
                    onClose={closeContextMenu} 
                />
            )}
        </div>
    );
}
