import React from 'react';
import styles from './MapContextMenu.module.scss';

export interface ContextMenuData {
  x: number;
  y: number;
  lng: number;
  lat: number;
  elevation: number | null;
}

interface MapContextMenuProps {
  data: ContextMenuData;
  onClose: () => void;
}

// Hilfsfunktion: Konvertiert Dezimalgrad in Grad, Minuten, Sekunden (DMS)
function toDMS(coordinate: number, isLng: boolean) {
  const absolute = Math.abs(coordinate);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

  const direction = coordinate >= 0 
    ? (isLng ? 'E' : 'N') 
    : (isLng ? 'W' : 'S');

  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

export function MapContextMenu({ data, onClose }: MapContextMenuProps) {
  const { x, y, lng, lat, elevation } = data;

  const decimalFormat = `${lat.toFixed(5)}°, ${lng.toFixed(5)}°`;
  const dmsFormat = `${toDMS(lat, false)}, ${toDMS(lng, true)}`;
  const elevationFormat = elevation !== null ? `${Math.round(elevation)} m ü. NHN` : 'Höhe unbekannt';

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation(); // Verhindert, dass der Klick das Menü sofort schließt
    navigator.clipboard.writeText(text).then(() => {
      // Kurzes visuelles Feedback könnte hier hin, aber wir schließen einfach das Menü
      onClose();
    }).catch(err => {
      console.error('Kopieren fehlgeschlagen:', err);
    });
  };

  return (
    <div 
      className={styles.contextMenu}
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()} // Verhindert Schließen beim Klick auf das Menü selbst
    >
      <div className={styles.header}>Kopieren</div>
      <ul className={styles.list}>
        <li onClick={(e) => handleCopy(e, decimalFormat)} title="Dezimalgrad kopieren">
          <span className={styles.label}>Dezimal:</span>
          <span className={styles.value}>{decimalFormat}</span>
        </li>
        <li onClick={(e) => handleCopy(e, dmsFormat)} title="DMS kopieren">
          <span className={styles.label}>DMS:</span>
          <span className={styles.value}>{dmsFormat}</span>
        </li>
        {elevation !== null && (
          <li onClick={(e) => handleCopy(e, elevationFormat)} title="Höhe kopieren">
            <span className={styles.label}>Höhe:</span>
            <span className={styles.value}>{elevationFormat}</span>
          </li>
        )}
      </ul>
    </div>
  );
}
