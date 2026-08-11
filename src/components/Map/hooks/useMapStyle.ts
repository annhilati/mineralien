import { useState, useEffect } from 'react';
import { StyleSpecification } from 'maplibre-gl';
import { buildMapStyle } from '../MapStyleBuilder';
import { MapConfig } from '../config';

export function useMapStyle(config: MapConfig) {
    const [mapStyle, setMapStyle] = useState<StyleSpecification | string | null>(null);

    useEffect(() => {
        let isMounted = true;
        
        buildMapStyle(config)
            .then(style => {
                if (isMounted) setMapStyle(style);
            })
            .catch(err => console.error("Fehler beim Laden des Styles:", err));

        return () => {
            isMounted = false;
        };
    }, [config]); // Lade neu, falls sich die Config ändert

    return mapStyle;
}
