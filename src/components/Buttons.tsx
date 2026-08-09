import "./Buttons.scss"

export function Button({ children }: { children: React.ReactNode }) {
    return (
        <div className="button">
            {children}
        </div>
    )
} 

export function PanoramaButton({ src, width = "100%", height = "100%", children }: { src: string, width?: string, height?: string, children: React.ReactNode }) {
    return (
        <div className="panorama-button" style={{ width: width, height: height }}>
            <img src={src} className="panorama-image"></img>
            <div className="panorama-text">
                {children}
            </div>
        </div>
    )
} 