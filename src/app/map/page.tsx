import fs from 'fs';
import path from 'path';
import MapPageClient from './MapPageClient';

// @ts-expect-error: yaml import is handled by next-plugin-yaml
import fundstellenRaw from '../../../content/fundstellen.yaml';
// @ts-expect-error: yaml import is handled by next-plugin-yaml
import mineralienRaw from '../../../content/mineralien.yaml';

export default function MapPage() {
    // Verarbeite fundstellen und reiche base64 Daten durch
    const fundstellen = fundstellenRaw.map((f: any) => {
        const result = { ...f };
        
        if (f.minerals && Array.isArray(f.minerals)) {
            result.mineralsData = f.minerals.map((minId: string) => {
                // Finde das Mineral in mineralien.yaml
                const mineralDef = mineralienRaw.find((m: any) => m.id === minId);
                
                if (!mineralDef) {
                    return { id: minId, name: minId };
                }
                
                let base64Data = null;
                if (mineralDef.stl) {
                    try {
                        const safeFile = mineralDef.stl.replace(/(\.\.\/|\.\.\\)/g, '');
                        const filePath = path.join(process.cwd(), 'content', 'crystals', safeFile);
                        if (fs.existsSync(filePath)) {
                            const fileBuffer = fs.readFileSync(filePath);
                            base64Data = fileBuffer.toString('base64');
                        }
                    } catch (e) {
                        console.error("Error loading STL:", e);
                    }
                }
                
                return {
                    id: minId,
                    name: mineralDef.name || minId,
                    base64Data
                };
            });
        }
        
        return result;
    });

    return <MapPageClient fundstellen={fundstellen} />;
}