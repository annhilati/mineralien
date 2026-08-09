// @ts-nocheck
import * as maplibregl from 'maplibre-gl';
import mlcontour from 'maplibre-contour';
import { MapConfig } from './config';

// 1. Contour Source Generator lazy initialisieren, um SSR-Crashes zu vermeiden
let demSource: any = null;

function getDemSource(config: MapConfig) {
    if (!demSource) {
        demSource = new mlcontour.DemSource({
            url: config.terrainUrl,
            encoding: config.terrainEncoding,
            maxzoom: config.terrainMaxZoom,
            worker: false // Workaround für Next.js (verhindert 'Failed to load module script' bei Web Workern)
        });
        demSource.setupMaplibre(maplibregl);
    }
    return demSource;
}

export async function buildMapStyle(config: MapConfig) {
    // 2. Lade Basis-JSON (Carto Voyager)
    const response = await fetch(config.baseStyleUrl);
    const baseStyle = await response.json();
    const newStyle = { ...baseStyle };

    // 3. Terrain und Hillshade Sources hinzufügen
    // 3. Terrain und Hillshade Sources hinzufügen (nur wenn aktiviert)
    if (config.features.enable3DTerrain || config.features.enableHillshade) {
        newStyle.sources['hillshade-source'] = {
            type: 'raster-dem',
            tiles: [config.terrainUrl],
            encoding: config.terrainEncoding,
            tileSize: 256,
            maxzoom: config.terrainMaxZoom
        };
    }

    if (config.features.enable3DTerrain) {
        newStyle.sources['terrain-source'] = {
            type: 'raster-dem',
            tiles: [config.terrainUrl],
            encoding: config.terrainEncoding,
            tileSize: 256,
            maxzoom: config.terrainMaxZoom
        };

        // 5. 3D Terrain aktivieren
        newStyle.terrain = {
            source: 'terrain-source',
            exaggeration: config.terrainExaggeration
        };
    }

    if (config.features.enableContours) {
        // 4. Contour Source hinzufügen
        newStyle.sources['contour-source'] = {
            type: 'vector',
            tiles: [
                getDemSource(config).contourProtocolUrl({
                    thresholds: config.contourThresholds,
                    elevationKey: 'ele',
                    levelKey: 'level',
                    contourLayer: 'contours'
                })
            ],
            maxzoom: config.terrainMaxZoom
        };
    }

    // 6. Hillshade Layer und Contours einfügen (nur wenn aktiviert)
    const backgroundIndex = newStyle.layers.findIndex((l: any) => l.id === 'background');
    const waterwayIndex = newStyle.layers.findIndex((l: any) => l.id === 'waterway');
    
    if (config.features.enableHillshade) {
        // Hillshade über das Landcover (Wald/Wiese) legen, 
        // aber UNTER 'waterway' (Bäche) und 'water' (Seen), damit das Wasser nicht abgedunkelt wird!
        const insertIndex = waterwayIndex !== -1 ? waterwayIndex : backgroundIndex + 1;
        
        newStyle.layers.splice(insertIndex, 0, {
            id: 'hillshade',
            type: 'hillshade',
            source: 'hillshade-source',
            paint: {
                'hillshade-shadow-color': config.customColors?.hillshade || '#2c353b', 
                'hillshade-highlight-color': 'rgba(0,0,0,0)', 
                'hillshade-exaggeration': config.hillshadeExaggeration ?? 0.45
            }
        });
    }

    if (config.features.enableContours) {
        // Höhenlinien-Layer anhängen
        newStyle.layers.push({
            id: 'contour-lines',
            type: 'line',
            source: 'contour-source',
            'source-layer': 'contours',
            paint: {
                'line-color': config.customColors?.contours || '#637555',
                'line-opacity': 0.4,
                'line-width': [
                    'match',
                    ['get', 'level'],
                    1, 1.2,
                    0.5
                ]
            }
        });
    }

    // Höhenlinien-Beschriftung
    // newStyle.layers.push({
    //     id: 'contour-labels',
    //     type: 'symbol',
    //     source: 'contour-source',
    //     'source-layer': 'contours',
    //     filter: ['>', ['get', 'level'], 0], // Nur Hauptlinien beschriften
    //     layout: {
    //         'symbol-placement': 'line',
    //         'text-field': ['concat', ['to-string', ['get', 'ele']], ' m'],
    //         'text-font': ['Open Sans Regular'], // Voyager Standardfont
    //         'text-size': 11
    //     },
    //     paint: {
    //         'text-color': '#756955',
    //         'text-halo-color': '#ffffff',
    //         'text-halo-width': 2
    //     }
    // });

    // Partielle Overrides für Carto Voyager
    newStyle.layers = newStyle.layers.map((layer: any) => {
        // 3D Gebäude (nur wenn 3D aktiv ist)
        if (config.features.enable3DTerrain && layer.id === 'building') {
            return {
                ...layer,
                type: 'fill-extrusion',
                paint: {
                    'fill-extrusion-color': config.customColors?.buildings || '#9e836d',
                    'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 8],
                    'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
                    'fill-extrusion-opacity': 0.9
                }
            };
        }
        if (config.features.enable3DTerrain && layer.id === 'building-top') {
            return { ...layer, layout: { ...layer.layout, visibility: 'none' } };
        }

        // Sichtbarkeit und Styling von Wanderwegen / Pfaden / Tracks anpassen
        if (layer.id.includes('path') || layer.id.includes('track') || layer.id.includes('footway')) {
            const newLayer = { ...layer };
            
            if (config.minZoomOverrides && config.minZoomOverrides.paths) {
                newLayer.minzoom = config.minZoomOverrides.paths;
            }

            if (config.features.enableCustomColors && config.customColors?.paths && newLayer.type === 'line') {
                const isCasing = layer.id.includes('casing');
                newLayer.paint = {
                    ...newLayer.paint,
                    'line-color': config.customColors.paths,
                    'line-opacity': isCasing ? 0.2 : 1.0,
                    'line-width': isCasing ? 
                        ['interpolate', ['linear'], ['zoom'], 11.5, 3, 15, 5, 18, 10] :
                        ['interpolate', ['linear'], ['zoom'], 11.5, 1.5, 15, 3, 18, 6]
                };
            }
            
            return newLayer;
        }

        // Eigene Farben nur anwenden, wenn aktiviert und vorhanden
        if (config.features.enableCustomColors && config.customColors) {
            if (layer.id === 'background') {
                return {
                    ...layer,
                    paint: { ...layer.paint, 'background-color': config.customColors.background }
                };
            }

            if (layer.id.startsWith('landuse') && layer.type === 'fill') {
                return {
                    ...layer,
                    paint: { ...layer.paint, 'fill-color': config.customColors.residential }
                };
            }

            if (layer.id === 'landcover' && layer.type === 'fill') {
                return {
                    ...layer,
                    paint: {
                        ...layer.paint,
                        'fill-color': [
                            'match',
                            ['get', 'class'],
                            'wood', config.customColors.forest,
                            'grass', config.customColors.grass,
                            'recreation_ground', config.customColors.grass,
                            'sand', config.customColors.grass,
                            'crop', config.customColors.crop,
                            'snow', config.customColors.glacier,
                            'glacier', config.customColors.glacier,
                            config.customColors.grass
                        ]
                    }
                };
            }

            if (layer.id.startsWith('park') && layer.type === 'fill') {
                return {
                    ...layer,
                    paint: { ...layer.paint, 'fill-color': config.customColors.national_park }
                };
            }

            if (layer.id === 'water' && layer.type === 'fill') {
                return {
                    ...layer,
                    paint: { ...layer.paint, 'fill-color': config.customColors.water }
                };
            }

            if (layer.id === 'waterway' && layer.type === 'line') {
                return {
                    ...layer,
                    paint: { ...layer.paint, 'line-color': config.customColors.waterway }
                };
            }
        }

        return layer;
    });

    // 7. Konsistenz-Filter: Verhindert, dass sich die Farben ab Zoom X ändern
    if (config.features.freezeColorsAtZoom != null) {
        const TARGET_ZOOM = config.features.freezeColorsAtZoom;
        
        newStyle.layers = newStyle.layers.map((layer: any) => {
            if (!layer.paint) return layer;
            
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
    }

    return newStyle;
}
