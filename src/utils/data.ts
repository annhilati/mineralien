import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { loadYaml } from './yamlLoader';
import { Fundstelle, MineralData } from '@/types';

// --- Zod Schemata für die rohen YAML-Daten ---

const MineralRawSchema = z.object({
    id: z.string(),
    name: z.string().optional(),
    stl: z.string().optional()
});
const MineralienArraySchema = z.array(MineralRawSchema);

const FundstelleRawSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    latitude: z.coerce.number(), // string "47.1" wird automatisch zu number 47.1 konvertiert
    longitude: z.coerce.number(),
    minerals: z.array(z.string()).optional()
});

// Cache für die rohen Mineralien-Daten, um sie nicht für jede Fundstelle neu zu parsen
let cachedMineralienRaw: z.infer<typeof MineralienArraySchema> | null = null;

function getMineralienRaw() {
    if (!cachedMineralienRaw) {
        cachedMineralienRaw = loadYaml('content/mineralien.yaml', MineralienArraySchema);
    }
    return cachedMineralienRaw;
}

export function getMineralDataWithBase64(minId: string): MineralData {
    const mineralienRaw = getMineralienRaw();
    const mineralDef = mineralienRaw.find(m => m.id === minId);

    if (!mineralDef) {
        return { id: minId, name: minId };
    }

    let base64Data: string | undefined = undefined;
    
    if (mineralDef.stl) {
        try {
            // Path Traversal verhindern
            const safeFile = mineralDef.stl.replace(/(\.\.\/|\.\.\\)/g, '');
            const filePath = path.join(process.cwd(), 'content', 'crystals', safeFile);
            
            if (fs.existsSync(filePath)) {
                const fileBuffer = fs.readFileSync(filePath);
                base64Data = fileBuffer.toString('base64');
            } else {
                console.warn(`STL file not found for mineral ${minId}: ${filePath}`);
            }
        } catch (e) {
            console.error(`Error loading STL for ${minId}:`, e);
        }
    }
    
    return {
        id: mineralDef.id,
        name: mineralDef.name || mineralDef.id,
        base64Data
    };
}

export function getFundstellen(): Fundstelle[] {
    // 1. Lade und validiere die Daten strikt über Zod
    const rawFundstellen = loadYaml('content/fundstellen.yaml', z.array(FundstelleRawSchema));

    // 2. Mappe die validierten Rohdaten auf unser reiches Frontend-Datenmodell (inkl. Base64 STLs)
    return rawFundstellen.map((raw) => {
        const fundstelle: Fundstelle = {
            id: raw.id,
            title: raw.title,
            description: raw.description || "",
            latitude: raw.latitude,
            longitude: raw.longitude,
        };

        if (raw.minerals && raw.minerals.length > 0) {
            fundstelle.minerals = raw.minerals;
            fundstelle.mineralsData = raw.minerals.map(minId => getMineralDataWithBase64(minId));
        }

        return fundstelle;
    });
}
