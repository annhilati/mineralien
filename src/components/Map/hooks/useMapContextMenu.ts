import { useState, useCallback } from 'react';
import { ContextMenuData } from '../MapContextMenu';

export function useMapContextMenu() {
    const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);

    const handleContextMenu = useCallback((e: any) => {
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
    }, []);

    const closeContextMenu = useCallback(() => {
        setContextMenu(prev => prev ? null : null);
    }, []);

    return {
        contextMenu,
        handleContextMenu,
        closeContextMenu
    };
}
