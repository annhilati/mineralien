import "./Buttons.scss"

export function Button({ children: label }: { children: React.ReactNode }) {
    return (
        <div className="button">
            {label}
        </div>
    )
} 

export function PanoramaButton({ label, width = "100%", height = "100%", children }: { label: React.ReactNode, width?: string, height?: string, children: React.ReactNode }) {
    return (
        <div className="panorama-button" style={{ width: width, height: height }}>
            <div className="panorama-image">
                {children}
            </div>
            <div className="panorama-text">
                {label}
            </div>
        </div>
    )
} 