import "./Button.scss"

export default function Button({ children }: { children: React.ReactNode }) {
    return (
        <div className="button">
            {children}
        </div>
    )
} 