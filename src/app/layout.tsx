import type { Metadata } from "next";
import Link from 'next/link';
import { Poppins, Lato, Montserrat } from "next/font/google";

import AsciiBackground from "@/components/AsciiBackground";
import "./globals.scss";
import "./layout.scss";
import 'maplibre-gl/dist/maplibre-gl.css';

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

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["600"],
    variable: "--next-font-montserrat",
});

export const metadata: Metadata = {
    title: "Mineralien App",
    description: "A stunning Next.js application",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="de" className={`${poppins.variable} ${lato.variable} ${montserrat.variable}`}>
            <body>
                <Header />
                {children}
            </body>
        </html>
    );
}

function Header() {
    return (
        <header className="header">
            <AsciiBackground amplitudes={[1, 0.7]} zIndex={-1} fontSize={10}/>
            <div className="header-content">
                <Link href="/"><div className="textmark">Mineralien</div></Link>
                <nav className="navigation">
                    sd
                </nav>
            </div>
        </header>
    );

}