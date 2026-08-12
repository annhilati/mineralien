import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { z } from 'zod';

/**
 * Lädt eine YAML-Datei vom Dateisystem, parst sie und validiert sie gegen ein Zod-Schema.
 * 
 * @param relativePath - Pfad zur YAML-Datei relativ zum Projekt-Root (z.B. 'content/fundstellen.yaml')
 * @param schema - Zod-Schema, gegen das die Daten geprüft werden sollen
 * @returns Die streng typisierten, fertig validierten Daten
 */
export function loadYaml<T>(relativePath: string, schema: z.ZodSchema<T>): T {
    const fullPath = path.join(process.cwd(), relativePath);
    
    if (!fs.existsSync(fullPath)) {
        throw new Error(`YAML file not found: ${fullPath}`);
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    
    // YAML in normales JS-Objekt umwandeln
    const rawData = yaml.load(fileContents);
    
    // Daten durch den Zod-Validator jagen
    const result = schema.safeParse(rawData);
    
    if (!result.success) {
        console.error(`Validation failed for ${relativePath}:`);
        console.dir(result.error.format(), { depth: null });
        throw new Error(`Zod validation error in ${relativePath}`);
    }
    
    return result.data;
}
