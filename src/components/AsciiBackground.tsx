"use client";

import React, { useEffect, useRef } from 'react';
import { createNoise3D } from 'simplex-noise';

// Diese Zeichenkette definiert die "Dichte" - von dunkel (Leerzeichen) zu hell (@)
const DENSITY = " .-=+*#%@";

export interface AsciiBackgroundProps {
    dt?: number;
    zoom?: number;
    fontSize?: number;
    amplitudes?: number[];
    zIndex?: number;
}

/** In einem Element benutzen um dessen Hintergund auszufüllen */ 
export default function AsciiBackground({
    dt = 0.0007,
    zoom = 0.03,
    fontSize = 14,
    amplitudes = [1],
    zIndex = 0,
}: AsciiBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const timeRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        
        // Simplex Noise Instanz erstellen
        const noise3D = createNoise3D();

        // Canvas an die Größe des Elternelements (Parent) anpassen
        const resize = () => {
            if (!canvas.parentElement) return;
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        };
        
        window.addEventListener('resize', resize);
        resize();

        const render = () => {
            // Z-Achsen-Verschiebung für die Animation durch die "Slices"
            timeRef.current += dt; 
            const time = timeRef.current;
            
            // Hintergrund schwarz/dunkel einfärben
            ctx.fillStyle = '#1c1a20'; // Nutzt jetzt den echten Hintergrund deiner Seite
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Textfarbe festlegen
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; // Leicht transparentes Weiß für den Codex-Look
            
            ctx.font = `${fontSize}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Berechnen, wie viele Spalten und Zeilen auf den Bildschirm passen
            const cols = Math.floor(canvas.width / (fontSize * 0.6));
            const rows = Math.floor(canvas.height / fontSize);

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    
                    let totalNoise = 0;
                    let amplitudeSum = 0;

                    // Minecraft-ähnliches Octave-System
                    for (let i = 0; i < amplitudes.length; i++) {
                        const amplitude = amplitudes[i];
                        // Frequenz verdoppelt sich pro Oktave (Math.pow(2, i))
                        const freq = zoom * Math.pow(2, i);
                        
                        totalNoise += noise3D(x * freq, y * freq, time) * amplitude;
                        amplitudeSum += amplitude;
                    }
                    
                    // Auf -1 bis 1 normalisieren
                    const noiseVal = amplitudeSum > 0 ? totalNoise / amplitudeSum : 0;

                    // Linear auf 0 bis 1 übertragen
                    let bands = (noiseVal + 1) / 2;
                    
                    // Den passenden Buchstaben aus der DENSITY-Kette auswählen
                    const charIndex = Math.floor(bands * (DENSITY.length - 1));
                    const char = DENSITY[charIndex];

                    // Nur zeichnen, wenn es kein Leerzeichen ist (spart Performance)
                    if (char !== ' ') {
                        ctx.fillText(char, x * (fontSize * 0.6) + fontSize/2, y * fontSize + fontSize/2);
                    }
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [dt, zoom, fontSize, amplitudes]);

    return (
        <canvas 
            ref={canvasRef} 
            style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                zIndex: zIndex,
                pointerEvents: 'none' // Damit man durch den Canvas klicken kann
            }} 
        />
    );
}
