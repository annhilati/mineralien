// Diese Datei wird nicht mehr benötigt, da wir Dateien serverseitig lesen.
// Wir lassen sie als dummy hier, damit es beim Next.js Build (Static Export) nicht knallt.
export const dynamic = 'force-static';
export async function GET() {
    return new Response('Deprecated', { status: 410 });
}
