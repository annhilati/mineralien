"use client";

import { useState, useRef } from 'react';
import { Map, Marker, MapRef, Popup } from 'react-map-gl/maplibre';
import { Compass } from 'lucide-react';
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

import { DARK_MAP_CONFIG } from './config';
import { useMapStyle } from './hooks/useMapStyle';

interface DarkMiniMapProps {
    fixed?: boolean;
    center?: { longitude: number; latitude: number };
    zoom?: number;
}

export default function DarkMiniMap({ fixed = false, center, zoom }: DarkMiniMapProps) {
    const mapRef = useRef<MapRef>(null);
    // 1. Modulares Styling laden mit unserer neuen Dark Config
    const mapStyle = useMapStyle(DARK_MAP_CONFIG);
    
    // ViewState aus Config mit übergebenen Props mergen
    const initialViewState = {
        ...DARK_MAP_CONFIG.initialViewState,
        ...(center ? { longitude: center.longitude, latitude: center.latitude } : {}),
        ...(zoom !== undefined ? { zoom } : {})
    };

    const [zoomState, setZoom] = useState(initialViewState.zoom);
    const [isLoaded, setIsLoaded] = useState(false);
    
    // State für das Popup
    const [showPopup, setShowPopup] = useState(false);

    if (!mapStyle) {
        return (
            <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--fuchsia)' }}>
                
            </div>
        );
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

                {/* Marker im Akzent-Design */}
                <Marker 
                    longitude={12.3481} 
                    latitude={47.2734} 
                    anchor="bottom"
                    onClick={(e) => {
                        e.originalEvent.stopPropagation();
                        setShowPopup(false)
                        mapRef.current?.flyTo({
                            center: [12.3481, 47.2734],
                            zoom: 14,
                            duration: 2500,
                            essential: true
                        });
                    }}
                >
                    <div 
                        className="map-marker"
                        onMouseEnter={() => setShowPopup(true)}
                        onMouseLeave={() => setShowPopup(false)}
                    >
                        <Compass color='var(--weiss)'/>
                    </div>
                </Marker>

                {/* Das Popup, das nur bei Hover gerendert wird */}
                {showPopup && (
                    <Popup 
                        longitude={12.3481} 
                        latitude={47.2734} 
                        anchor="bottom"
                        offset={45} // Verschiebt das Popup weiter nach oben, weg vom Marker
                        closeButton={false}
                        closeOnClick={false}
                        className="map-marker-popup"
                        style={{ zIndex: 10 }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--rot)' }}>Geheimnisvoller Ort</h3>
                            <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
                                Ein unentdecktes Mineralienvorkommen.
                            </p>
                        </div>
                    </Popup>
                )}
            </Map>
        </div>
    );
}
