import fs from 'fs';
import path from 'path';
import CrystalViewerClient from './CrystalViewerClient';

interface CrystalViewerProps {
    filename: string;
    color?: string;
    fixed?: boolean;
}

export default function CrystalViewer({ filename, color = '#ffffff', fixed = false }: CrystalViewerProps) {
    // Sicherheitscheck: Verhindert Directory Traversal
    const safeFile = filename.replace(/(\.\.\/|\.\.\\)/g, '');
    const filePath = path.join(process.cwd(), 'content', 'crystals', safeFile);
    
    let base64Data = '';
    try {
        if (!fs.existsSync(filePath)) {
            return <div style={{ color: 'red', padding: '20px' }}>STL Datei nicht gefunden: {safeFile}</div>;
        }
        const fileBuffer = fs.readFileSync(filePath);
        base64Data = fileBuffer.toString('base64');
    } catch (e: any) {
        return <div style={{ color: 'red', padding: '20px' }}>Fehler beim Laden der 3D-Datei: {e.message}</div>;
    }

    return <CrystalViewerClient base64Data={base64Data} color={color} fixed={fixed} />;
}
