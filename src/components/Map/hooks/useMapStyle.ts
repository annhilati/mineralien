import { useState, useEffect } from 'react';
import { buildMapStyle } from '../MapBuilder';
import { MapConfig } from '../config';

export function useMapStyle(config: MapConfig) {
    const [mapStyle, setMapStyle] = useState<any>(null);

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
