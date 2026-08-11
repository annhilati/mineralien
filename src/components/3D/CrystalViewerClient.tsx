"use client";

import React, { Suspense, useMemo, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { STLLoader } from 'three-stdlib';
import * as THREE from 'three';

function Model({ base64Data, color }: { base64Data: string, color: string }) {
    const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
    const [edgesGeometry, setEdgesGeometry] = useState<THREE.EdgesGeometry | null>(null);

    useEffect(() => {
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        const loader = new STLLoader();
        const parsedGeom = loader.parse(bytes.buffer);
        
        // Exakte Skalierung statt Bounds-Animation
        parsedGeom.computeBoundingBox();
        const size = new THREE.Vector3();
        parsedGeom.boundingBox!.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        // Skaliere die längste Seite auf exakt 38 Einheiten (entspricht ca. 80% Füllung bei Cam-Distanz 72)
        const scale = 38 / maxDim;
        parsedGeom.scale(scale, scale, scale);
        parsedGeom.center();
        
        const edges = new THREE.EdgesGeometry(parsedGeom, 5); 
        
        setGeometry(parsedGeom);
        setEdgesGeometry(edges);
    }, [base64Data]);
    
    const solidMaterial = useMemo(() => {
        return new THREE.MeshBasicMaterial({ 
            color: '#000000', 
            transparent: true,
            opacity: 0.85, 
            side: THREE.DoubleSide,
            polygonOffset: true,
            polygonOffsetFactor: 1, 
            polygonOffsetUnits: 1
        });
    }, []);

    if (!geometry || !edgesGeometry) return null;

    return (
        <group>
            <mesh geometry={geometry} material={solidMaterial} />
            <lineSegments geometry={edgesGeometry}>
                <lineBasicMaterial color={color} transparent={true} opacity={0.9} />
            </lineSegments>
        </group>
    );
}

export default function CrystalViewerClient({ base64Data, color = '#ffffff', fixed = false }: { base64Data: string, color?: string, fixed?: boolean }) {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas camera={{ position: [0, 40, 60], fov: 45 }}>
                <Suspense fallback={null}>
                    <Model base64Data={base64Data} color={color} />
                </Suspense>
                <OrbitControls 
                    autoRotate 
                    autoRotateSpeed={1.5} 
                    enableDamping 
                    enableZoom={!fixed} 
                    enablePan={!fixed}
                    enableRotate={!fixed}
                    minPolarAngle={Math.PI / 3} // 60 Grad (entspricht 30 Grad von oben)
                    maxPolarAngle={Math.PI / 3} // Kamera-Winkel fest auf 30 Grad locken
                    makeDefault 
                />
            </Canvas>
        </div>
    );
}
