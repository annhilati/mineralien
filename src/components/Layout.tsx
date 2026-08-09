import React from 'react';
import './Layout.scss';

interface LayoutProps {
    children: React.ReactNode;
    row?: boolean;
    ratios?: number[];
    gap?: string;
}

export default function Layout({ children, row = false, ratios = [], gap = "var(--gap-strong)" }: LayoutProps) {
    const childrenArray = React.Children.toArray(children);

    return (
        <div className={`layout-container ${row ? 'layout-row' : 'layout-column'}`} style={{ gap: gap }}>
            {childrenArray.map((child, index) => {
                // Den Flex-Wert aus der Liste ziehen. Wenn nicht vorhanden:
                // Im Row-Modus standardmäßig 1 (gleich breite Spalten).
                // Im Column-Modus standardmäßig undefined (normale Höhe, kein flex-basis: 0).
                const flexValue = ratios[index] !== undefined 
                    ? ratios[index] 
                    : (row ? 1 : undefined);
                
                return (
                    <div 
                        key={index} 
                        className="layout-item" 
                        style={flexValue !== undefined ? { flex: flexValue } : undefined}
                    >
                        {child}
                    </div>
                );
            })}
        </div>
    );
}