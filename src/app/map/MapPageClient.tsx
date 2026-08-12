"use client";

import React, { useState, useRef, useEffect } from "react";
import { Marker, Popup, useMap } from "react-map-gl/maplibre";
import { Navigation2, Compass } from "lucide-react";
import TacticalMap, { TacticalMapRef } from "@/components/TacticalMap/TacticalMap";
import CrystalViewerClient from "@/components/3D/CrystalViewerClient";
import { Fundstelle, MineralData } from "@/types";


const ZoomDependentLabel = ({ text, minZoom }: { text: string, minZoom: number }) => {
    const { current: map } = useMap();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!map) return;
        
        const handleZoom = () => {
            const isVis = map.getZoom() >= minZoom;
            if (isVis !== visible) setVisible(isVis);
        };
        
        handleZoom(); // Initiale Prüfung
        map.on('zoom', handleZoom);
        
        return () => {
            map.off('zoom', handleZoom);
        };
    }, [map, visible, minZoom]);

    return (
        <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '6px',
            color: 'var(--weiss)',
            fontFamily: 'var(--font-title)',
            fontSize: '13px',
            fontWeight: 500,
            textShadow: '0 0 6px var(--bg-primary), 0 0 6px var(--bg-primary), 0 0 6px var(--bg-primary)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.4s ease-in-out'
        }}>
            {text}
        </div>
    );
};

const PulseMarker = () => {
    const [rotation, setRotation] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        let isMounted = true;

        const tick = () => {
            if (!isMounted) return;
            // Stillstand (2 bis 22 Sekunden)
            const delay = (Math.random() * 20000) + 2000;
            
            timeoutId = setTimeout(() => {
                if (!isMounted) return;
                // Rotation um -130 bis +130 Grad
                const rotateBy = (Math.random() * 260) - 130;
                // Animationsdauer (1 bis 3 Sekunden)
                const animDuration = (Math.random() * 2000) + 1000;
                
                setRotation(prev => prev + rotateBy);
                setDuration(animDuration);
                
                // Nach Abschluss der Animation beginnt der nächste Stillstand-Zyklus
                timeoutId = setTimeout(tick, animDuration);
            }, delay);
        };

        tick();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <div className="pulse-marker" style={{
            transform: `rotate(${rotation}deg)`,
            transition: `transform ${duration}ms ease-in-out`
        }}>
            <Navigation2 fill="var(--orange)" color="var(--orange)" strokeLinejoin="miter" strokeLinecap="square" size={28} />
        </div>
    );
};

export default function MapPageClient({ fundstellen }: { fundstellen: Fundstelle[] }) {
    const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
    const mapRef = useRef<TacticalMapRef>(null);

    return (
        <main style={{ 
            flex: 1, 
            margin: 'var(--gap-light)', 
            position: 'relative', 
            outline: '2px solid rgb(from var(--weiss) r g b / 0.2)', 
            outlineOffset: '4px', 
            borderRadius: 'var(--radius-heavy)',
            overflow: 'hidden'
        }}>
            <TacticalMap ref={mapRef} center={{ longitude: 13.097265222611101, latitude: 50.858742456189496  }} zoom={5.3}>
                <Marker 
                    longitude={13.738412463488196} 
                    latitude={51.05093316571198} 
                    anchor="center"
                    style={{ pointerEvents: 'none' }}
                >
                    <PulseMarker />
                </Marker>

                {fundstellen.map((f) => (
                    <React.Fragment key={f.id}>
                        <Marker 
                            longitude={f.longitude} 
                            latitude={f.latitude} 
                            anchor="bottom"
                            onClick={(e) => {
                                e.originalEvent.stopPropagation();
                                setHoveredMarker(null);
                                mapRef.current?.flyTo({
                                    center: [f.longitude, f.latitude],
                                    zoom: 14,
                                    duration: 2500,
                                    essential: true
                                });
                            }}
                        >
                            <div 
                                className="map-marker"
                                onMouseEnter={() => setHoveredMarker(f.id)}
                                onMouseLeave={() => setHoveredMarker(null)}
                            >
                                <Compass size="var(--icon-size)" color='var(--weiss)'/>
                                <ZoomDependentLabel text={f.title} minZoom={10} />
                            </div>
                        </Marker>

                        {hoveredMarker === f.id && (
                            <Popup 
                                longitude={f.longitude} 
                                latitude={f.latitude} 
                                anchor="bottom"
                                offset={45}
                                closeButton={false}
                                closeOnClick={false}
                                maxWidth={f.mineralsData && f.mineralsData.length > 0 ? "500px" : "350px"}
                                className="map-marker-popup"
                            >
                                <div className="popup-wrapper">
                                    <h3 className="popup-title">{f.title}</h3>
                                    { (f.description) && <p className="popup-text">
                                        {f.description}
                                    </p>}
                                    
                                    {/* Mineralien-Boxen */}
                                    {f.mineralsData && f.mineralsData.length > 0 && (
                                        <div className="mineral-wrapper">
                                            {f.mineralsData.map(mineral => (
                                                <div key={mineral.id} className="mineral-box">
                                                    <div className="mineral-name">
                                                        {mineral.name}
                                                    </div>
                                                    <div className="mineral-render-wrapper">
                                                        {mineral.base64Data ? (
                                                            <CrystalViewerClient base64Data={mineral.base64Data} color="#ffffff" fixed={true} />
                                                        ) : (
                                                            <div style={{ padding: '10px', fontSize: '10px', color: 'red' }}>STL nicht gefunden</div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        )}
                    </React.Fragment>
                ))}
            </TacticalMap>

            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                pointerEvents: 'none',
                boxShadow: 'inset 0 0 7px 5px var(--bg-primary)'
            }} />
        </main>
    );
}
