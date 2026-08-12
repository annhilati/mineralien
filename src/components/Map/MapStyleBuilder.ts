import * as maplibregl from 'maplibre-gl';
import { StyleSpecification } from 'maplibre-gl';
import mlcontour from 'maplibre-contour';

type DemSource = InstanceType<typeof mlcontour.DemSource>;
import { MapConfig } from './config';

// 1. Contour Source Generator lazy initialisieren, um SSR-Crashes zu vermeiden
let demSource: DemSource | null = null;

function getDemSource(config: MapConfig): DemSource {
    if (!demSource) {
        demSource = new mlcontour.DemSource({
            url: config.terrainUrl!,
            encoding: config.terrainEncoding,
            maxzoom: config.terrainMaxZoom!,
            worker: false // Workaround für Next.js
        });
        
        // DataCloneError Fix: Wir müssen addProtocol abfangen und die ArrayBuffers kopieren (slice),
        // bevor sie an MapLibre übergeben werden. Da MapLibre die Buffer an Web Worker "transferiert"
        // (was sie detacht) und maplibre-contour Caching nutzt, würden dieselben Buffer mehrfach 
        // transferiert werden, was zum Absturz führt.
        demSource.setupMaplibre({
            addProtocol: (id: string, protocol: any) => {
                maplibregl.addProtocol(id, (params: any, abortOrCb: any) => {
                    if (typeof abortOrCb === 'function') {
                        // MapLibre v3 (Callback API)
                        return protocol(params, (err: any, data: any, cacheControl: any, expires: any) => {
                            if (data instanceof ArrayBuffer) {
                                data = data.slice(0);
                            }
                            abortOrCb(err, data, cacheControl, expires);
                        });
                    } else {
                        // MapLibre v4 (Promise API mit AbortController)
                        const promise = protocol(params, abortOrCb);
                        return promise.then((res: any) => {
                            if (res && res.data instanceof ArrayBuffer) {
                                res.data = res.data.slice(0);
                            }
                            return res;
                        });
                    }
                });
            }
        });
    }
    return demSource;
}

export async function buildMapStyle(originalConfig: MapConfig): Promise<StyleSpecification> {
    // Clone config to safely modify it
    const config = { ...originalConfig };
    
    // Resolve arbitrary CSS expressions (like 'var(--rot)' or 'color-mix(...)') to real rgb() colors
    if (config.customColors && typeof window !== 'undefined') {
        config.customColors = Object.fromEntries(
            Object.entries(config.customColors).map(([k, v]) => {
                if (typeof v === 'string' && (v.includes('var(') || v.includes('color-mix') || v.includes('calc'))) {
                    const tempEl = document.createElement('div');
                    tempEl.style.color = v;
                    tempEl.style.display = 'none';
                    document.body.appendChild(tempEl);
                    let computedColor = getComputedStyle(tempEl).color;
                    document.body.removeChild(tempEl);

                    // Fix für MapLibre: Es versteht das moderne CSS "color(srgb ...)" nicht, also konvertieren wir es zu rgba()
                    if (computedColor && computedColor.startsWith('color(srgb')) {
                        const match = computedColor.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/);
                        if (match) {
                            const r = Math.round(parseFloat(match[1]) * 255);
                            const g = Math.round(parseFloat(match[2]) * 255);
                            const b = Math.round(parseFloat(match[3]) * 255);
                            const a = match[4] ? parseFloat(match[4]) : 1;
                            computedColor = `rgba(${r}, ${g}, ${b}, ${a})`;
                        }
                    }

                    return [k, computedColor && computedColor !== '' ? computedColor : v];
                }
                return [k, v];
            })
        ) as any;
    }

    // 2. Lade Basis-JSON (Carto Voyager)
    const response = await fetch(config.baseStyleUrl);
    const baseStyle = (await response.json()) as StyleSpecification;
    const newStyle = { ...baseStyle } as StyleSpecification;

    // 2.5 Hybrid-Injection für Satellitenbilder
    if (config.features.enableSatelliteBasemap) {
        newStyle.sources['satellite-source'] = {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256
        };

        const layersToInsert: any[] = [];

        layersToInsert.push({
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite-source',
            paint: {
                'raster-saturation': -1,
                'raster-brightness-min': 0.1,
                'raster-brightness-max': 0.7,
                'raster-contrast': 0.45
            }
        });

        // Globaler Farbfilter (z.B. Blaustich) über das Satellitenbild legen
        if (config.customColors?.satelliteTint) {
            layersToInsert.push({
                id: 'satellite-tint-layer',
                type: 'background',
                paint: {
                    'background-color': config.customColors.satelliteTint
                }
            });
        }

        const bgIndex = newStyle.layers.findIndex((l: any) => l.id === 'background');
        newStyle.layers.splice(bgIndex !== -1 ? bgIndex + 1 : 0, 0, ...layersToInsert);
    }

    // 3. Terrain und Hillshade Sources hinzufügen
    // 3. Terrain und Hillshade Sources hinzufügen (nur wenn aktiviert)
    if (config.features.enable3DTerrain || config.features.enableHillshade) {
        newStyle.sources['hillshade-source'] = {
            type: 'raster-dem',
            tiles: [config.terrainUrl!],
            encoding: config.terrainEncoding,
            tileSize: 256,
            maxzoom: config.terrainMaxZoom
        };
    }

    if (config.features.enable3DTerrain) {
        newStyle.sources['terrain-source'] = {
            type: 'raster-dem',
            tiles: [config.terrainUrl!],
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
                    thresholds: config.contourThresholds!,
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
    const satelliteIndex = newStyle.layers.findIndex((l: any) => l.id === 'satellite-layer');
    
    if (config.features.enableHillshade) {
        // Hillshade über das Landcover (Wald/Wiese) legen, 
        // aber UNTER 'waterway' (Bäche) und 'water' (Seen), damit das Wasser nicht abgedunkelt wird!
        let insertIndex = newStyle.layers.length;
        if (waterwayIndex !== -1) insertIndex = waterwayIndex;
        else if (satelliteIndex !== -1) insertIndex = satelliteIndex + 1;
        else if (backgroundIndex !== -1) insertIndex = backgroundIndex + 1;
        
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
            filter: ['>=', ['get', 'ele'], 40], // Verhindert Artefakte an Küsten und Inseln
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
        // Hybrid-Modus: Mache alle undurchsichtigen Flächen und Straßen (außer Grenzen) unsichtbar
        if (config.features.enableSatelliteBasemap) {
            if (layer.type === 'fill' || layer.type === 'fill-extrusion') {
                if (layer.id !== 'water' && layer.id !== 'landcover') {
                    return { ...layer, layout: { ...layer.layout, visibility: 'none' } };
                }
            }
            
            const isBoundary = layer.id.includes('boundary') || layer.id.includes('admin');
            const isPath = layer.id.includes('path') || layer.id.includes('track') || layer.id.includes('footway');
            
            if (layer.type === 'line' && layer.id !== 'contour-lines') {
                if (!isBoundary && !isPath) {
                    return { ...layer, layout: { ...layer.layout, visibility: 'none' } };
                }
            }
            
            // Grenzen für Satellitenkarte reparieren (sichtbar machen und färben)
            if (isBoundary) {
                layer.minzoom = 0; // Verhindert, dass Grenzen (wie Deutschland) erst spät aufploppen
                if (config.customColors?.boundaries && layer.type === 'line') {
                    const isState = layer.id.includes('4') || layer.id.includes('state') || layer.id.includes('province');
                    
                    layer.paint = { 
                        ...layer.paint, 
                        'line-color': config.customColors.boundaries,
                        'line-opacity': isState ? 0 : 0.6,
                        'line-width': isState ? 0.8 : 0.8
                    };
                }
            }
        }

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
                        ['interpolate', ['linear'], ['zoom'], 11.5, 2, 15, 3.5, 18, 7] :
                        ['interpolate', ['linear'], ['zoom'], 11.5, 1, 15, 2, 18, 4]
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

        // Sprache auf Deutsch umstellen (Carto / OpenMapTiles nutzt 'name:de')
        if (layer.layout && layer.layout['text-field']) {
            const textField = layer.layout['text-field'];
            
            if (typeof textField === 'string') {
                layer.layout['text-field'] = textField
                    .replace(/\{name_en\}/g, '{name:de}')
                    .replace(/\{name\}/g, '{name:de}');
            } else if (Array.isArray(textField)) {
                // Rekursives Ersetzen in Expressions (z.B. ['get', 'name_en'])
                const replaceName = (arr: any[]): any[] => {
                    return arr.map(item => {
                        if (typeof item === 'string') {
                            if (item === 'name' || item === 'name_en') return 'name:de';
                            if (item.includes('{name}') || item.includes('{name_en}')) {
                                return item.replace(/\{name_en\}/g, '{name:de}').replace(/\{name\}/g, '{name:de}');
                            }
                        } else if (Array.isArray(item)) {
                            return replaceName(item);
                        }
                        return item;
                    });
                };
                layer.layout['text-field'] = replaceName(textField);
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
