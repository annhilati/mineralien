import type { Metadata } from "next";
import Link from 'next/link';
import { Poppins, Lato } from "next/font/google";

import AsciiBackground from "@/components/AsciiBackground";
import "./globals.scss";
import "./layout.scss";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["200", "300", "400", "500", "600", "700"],
    variable: "--next-font-poppins",
});

const lato = Lato({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--next-font-lato",
});

export const metadata: Metadata = {
    title: "Mineralien App",
    description: "A stunning Next.js application",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="de" className={`${poppins.variable} ${lato.variable}`}>
            <body>
                <Header />
                <main className="content-wrapper">
                    <div className="content">
                        {children}
                    </div>
                </main>
            </body>
        </html>
    );
}

function Header() {
    return (
        <header className="header" style={{ background: "none"}}>
            <AsciiBackground amplitudes={[1, 0.7]} zIndex={-1} fontSize={10}/>
            <div className="header-content" style={{ background: "var(--bg-primary)", boxShadow: "0 0 20px 50px var(--bg-primary)"}}>
                <Link href="/"><div className="textmark">Mineralien</div></Link>
                <nav className="navigation">
                    sd
                </nav>
            </div>
        </header>
    );

}