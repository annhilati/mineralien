export default function ContentLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="content-wrapper">
            <div className="central-content">
                {children}
            </div>
        </main>
    );
}
