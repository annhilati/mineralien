"use client";

import React, { useState, useRef } from "react";
import { Marker, Popup } from "react-map-gl/maplibre";
import { Compass } from "lucide-react";
import DarkMiniMap, { DarkMiniMapRef } from "@/components/Map/DarkMiniMap";

// @ts-expect-error: yaml import is handled by next-plugin-yaml
import fundstellen from "../../../content/fundstellen.yaml";

export default function MapPage() {
    const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
    const mapRef = useRef<DarkMiniMapRef>(null);

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
            <DarkMiniMap ref={mapRef} center={{ longitude: 13.097265222611101, latitude: 49.858742456189496 }} zoom={5.8}>
                {fundstellen.map((f: any) => (
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
                                maxWidth="350px"
                                className="map-marker-popup"
                            >
                                <div className="popup-wrapper">
                                    <h3 className="popup-title">{f.title}</h3>
                                    <p className="popup-text">
                                        {f.description}
                                    </p>
                                </div>
                            </Popup>
                        )}
                    </React.Fragment>
                ))}
            </DarkMiniMap>
            {/* Schattige Verblendung (Vignette) über den Kanten */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                pointerEvents: 'none',
                boxShadow: 'inset 0 0 7px 5px var(--bg-primary)'
            }} />
        </main>
    );
}