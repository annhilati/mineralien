import DarkMiniMap from "@/components/Map/DarkMiniMap";


export default function MapPage() {
    return (
        <main style={{ 
            flex: 1, 
            margin: 'var(--gap-light)', 
            position: 'relative', 
            outline: '2px solid var(--weiss)', 
            outlineOffset: '4px', 
            borderRadius: 'var(--radius-heavy)',
            overflow: 'hidden'
        }}>
            <DarkMiniMap center={{ longitude: 13.097265222611101, latitude: 49.858742456189496 }} zoom={5.8}></DarkMiniMap>
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