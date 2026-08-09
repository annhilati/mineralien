import { useState, useEffect } from 'react';
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
import { buildMapStyle } from './MapBuilder';
import { MapContextMenu, ContextMenuData } from './MapContextMenu';

export default function Karte() {
    const [mapStyle, setMapStyle] = useState<any>(null);
    const [zoom, setZoom] = useState(MAP_CONFIG.initialViewState.zoom);
    const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);

    const handleContextMenu = (e: any) => {
        e.originalEvent.preventDefault();
        const { lng, lat } = e.lngLat;
        const elevation = e.target.queryTerrainElevation([lng, lat]);
        
        const container = e.target.getContainer();
        const mapWidth = container.clientWidth;
        const mapHeight = container.clientHeight;

        // Geschätzte Menü-Größe inkl. Puffer
        const menuWidth = 240; 
        const menuHeight = 160;

        let safeX = e.point.x;
        let safeY = e.point.y;

        // Klappt das Menü nach links auf, wenn am rechten Rand geklickt wird
        if (safeX + menuWidth > mapWidth) {
            safeX = e.point.x - menuWidth;
        }
        
        // Klappt das Menü nach oben auf, wenn am unteren Rand geklickt wird
        if (safeY + menuHeight > mapHeight) {
            safeY = e.point.y - menuHeight;
        }
        
        setContextMenu({
            x: safeX,
            y: safeY,
            lng,
            lat,
            elevation
        });
    };

    const closeContextMenu = () => {
        if (contextMenu) setContextMenu(null);
    };

    useEffect(() => {
        buildMapStyle()
            .then(style => setMapStyle(style))
            .catch(err => console.error("Fehler beim Laden des Styles:", err));
    }, []);

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
                    onClose={() => setContextMenu(null)} 
                />
            )}
        </div>
    );
}
