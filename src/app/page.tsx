import Karte from "@/components/Map";
import Layout from "@/components/Layout"
import Link from "next/link"
import { Button, PanoramaButton } from "@/components/Buttons"


export default function Home() {
    return (
        <Layout row ratios={[1, 3]}>
            <Layout gap="10px">
                <div style={{ background: "var(--bg-primary)"}}>
                    d
                </div>
                <Link href="#"><Button>Kontakt</Button></Link>
                <Link href="https://discord.com/users/720992368110862407"><Button>Discord</Button></Link>
            </Layout>
            <Layout>
                <Link href="https://www.mineralienatlas.de/lexikon/index.php/MediaDataShow?hoch=100&quer=1&sort=Text(a)&bildertyp=&Nutzer=Annhilati">
                    <PanoramaButton src="https://cdn.prod.website-files.com/660aef02bc8087e5ee782873/661d1f612b2674405c211920_IMG_20240414_173111%5B1%5D.jpg" height="350px">Bild-Beiträge</PanoramaButton>
                </Link>
                <Karte />
            </Layout >
        </Layout>
    );
}
