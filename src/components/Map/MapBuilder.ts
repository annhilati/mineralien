// @ts-nocheck
import * as maplibregl from 'maplibre-gl';
import mlcontour from 'maplibre-contour';
import { MAP_CONFIG } from './config';

// 1. Contour Source Generator lazy initialisieren, um SSR-Crashes zu vermeiden
let demSource: any = null;

function getDemSource() {
    if (!demSource) {
        demSource = new mlcontour.DemSource({
            url: MAP_CONFIG.terrainUrl,
            encoding: MAP_CONFIG.terrainEncoding,
            maxzoom: MAP_CONFIG.terrainMaxZoom,
            worker: false // Workaround für Next.js (verhindert 'Failed to load module script' bei Web Workern)
        });
        demSource.setupMaplibre(maplibregl);
    }
    return demSource;
}

export async function buildMapStyle() {
    // 2. Lade Basis-JSON (Carto Voyager)
    const response = await fetch(MAP_CONFIG.baseStyleUrl);
    const baseStyle = await response.json();
    const newStyle = { ...baseStyle };

    // 3. Terrain und Hillshade Sources hinzufügen
    newStyle.sources['terrain-source'] = {
        type: 'raster-dem',
        tiles: [MAP_CONFIG.terrainUrl],
        encoding: MAP_CONFIG.terrainEncoding,
        tileSize: 256,
        maxzoom: MAP_CONFIG.terrainMaxZoom
    };

    newStyle.sources['hillshade-source'] = {
        type: 'raster-dem',
        tiles: [MAP_CONFIG.terrainUrl],
        encoding: MAP_CONFIG.terrainEncoding,
        tileSize: 256,
        maxzoom: MAP_CONFIG.terrainMaxZoom
    };

    // 4. Contour Source hinzufügen
    newStyle.sources['contour-source'] = {
        type: 'vector',
        tiles: [
            getDemSource().contourProtocolUrl({
                thresholds: MAP_CONFIG.contourThresholds,
                elevationKey: 'ele',
                levelKey: 'level',
                contourLayer: 'contours'
            })
        ],
        maxzoom: MAP_CONFIG.terrainMaxZoom
    };

    // 5. 3D Terrain aktivieren
    newStyle.terrain = {
        source: 'terrain-source',
        exaggeration: MAP_CONFIG.terrainExaggeration
    };

    // 6. Layer einfügen / anpassen
    const backgroundIndex = newStyle.layers.findIndex(l => l.id === 'background');
    
    // Hillshade direkt über den Hintergrund legen
    newStyle.layers.splice(backgroundIndex + 1, 0, {
        id: 'hillshade',
        type: 'hillshade',
        source: 'hillshade-source',
        paint: {
            'hillshade-shadow-color': '#473B24',
            'hillshade-exaggeration': 0.7
        }
    });

    // Höhenlinien-Layer anhängen
    newStyle.layers.push({
        id: 'contour-lines',
        type: 'line',
        source: 'contour-source',
        'source-layer': 'contours',
        paint: {
            'line-color': '#756955',
            'line-opacity': 0.6,
            'line-width': [
                'match',
                ['get', 'level'],
                1, 1.2,
                0.5
            ]
        }
    });

    // Höhenlinien-Beschriftung
    newStyle.layers.push({
        id: 'contour-labels',
        type: 'symbol',
        source: 'contour-source',
        'source-layer': 'contours',
        filter: ['>', ['get', 'level'], 0], // Nur Hauptlinien beschriften
        layout: {
            'symbol-placement': 'line',
            'text-field': ['concat', ['to-string', ['get', 'ele']], ' m'],
            'text-font': ['Open Sans Regular'], // Voyager Standardfont
            'text-size': 11
        },
        paint: {
            'text-color': '#756955',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2
        }
    });

    // Partielle Overrides für Carto Voyager
    newStyle.layers = newStyle.layers.map((layer: any) => {
        // 3D Gebäude statt "flacher" Schatten
        if (layer.id === 'building') {
            return {
                ...layer,
                type: 'fill-extrusion',
                paint: {
                    'fill-extrusion-color': '#2a2a2a', // Dunkles Grau, passend zum Dark-Mode
                    // Wir nutzen 'render_height' oder 'height', falls vorhanden, ansonsten pauschal 8 Meter
                    'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 8],
                    'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
                    'fill-extrusion-opacity': 0.9
                }
            };
        }
        if (layer.id === 'building-top') {
            // Ausblenden, da wir echtes fill-extrusion nutzen
            return { ...layer, layout: { ...layer.layout, visibility: 'none' } };
        }

        return layer;
    });

    // 7. Konsistenz-Filter: Verhindert, dass sich die Farben ab Zoom 13.5 ändern
    const TARGET_ZOOM = 13;
    
    newStyle.layers = newStyle.layers.map((layer: any) => {
        if (!layer.paint) return layer;
        
        // Helfer, um Farben auf einen festen Zoomwert "einzufrieren"
        const freezeColor = (val: any) => {
            if (val && typeof val === 'object') {
                if (val.stops) {
                    let best = val.stops[0][1];
                    for (let stop of val.stops) {
                        if (stop[0] <= TARGET_ZOOM) best = stop[1];
                    }
                    return best;
                } else if (val[0] === 'interpolate' && val[2] && val[2][0] === 'zoom') {
                    let best = val[4];
                    for (let i = 3; i < val.length; i += 2) {
                        if (val[i] <= TARGET_ZOOM) best = val[i+1];
                    }
                    return best;
                } else if (val[0] === 'step' && val[1] && val[1][0] === 'zoom') {
                    let best = val[2];
                    for (let i = 3; i < val.length; i += 2) {
                        if (val[i] <= TARGET_ZOOM) best = val[i+1];
                    }
                    return best;
                }
            }
            return null;
        };

        const newPaint = { ...layer.paint };
        
        // Friere alle Farb- und Transparenz-Übergänge ein (Waldflächen, Wiesen, Wasser)
        Object.keys(newPaint).forEach(key => {
            if (key.includes('color') || key.includes('opacity')) {
                const frozen = freezeColor(newPaint[key]);
                if (frozen !== null) {
                    newPaint[key] = frozen;
                }
            }
        });

        return { ...layer, paint: newPaint };
    });

    return newStyle;
}
