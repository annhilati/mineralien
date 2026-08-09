"use client";

import dynamic from 'next/dynamic';

// Next.js versucht standardmäßig alles auf dem Server vorzurendern (SSR).
// MapLibre und Web-Worker funktionieren aber nur im Browser (Client).
// Mit next/dynamic sagen wir Next.js: "Lade diese Komponente erst, wenn wir im Browser sind!"
const Karte = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', width: '100%', height: '100%', minHeight: '500px', justifyContent: 'center', alignItems: 'center' }}>
      Lade Karte...
    </div>
  )
});

export default Karte;
