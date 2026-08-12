import MapPageClient from './MapPageClient';
import { getFundstellen } from '@/utils/data';

export default function MapPage() {
    // Validiere und verarbeite Fundstellen inklusive der Base64 STL-Daten 
    const fundstellen = getFundstellen();

    return <MapPageClient fundstellen={fundstellen} />;
}