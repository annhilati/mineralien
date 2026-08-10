export default function ContentLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="content-wrapper">
            <div className="content">
                {children}
            </div>
        </main>
    );
}
