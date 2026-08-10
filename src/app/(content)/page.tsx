import Layout from "@/components/Layout"
import Link from "next/link"
import { Button, PanoramaButton } from "@/components/Buttons"
import DarkMiniMap from "@/components/Map/DarkMiniMap";


export default function Home() {
    return (
        <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Layout row ratios={[1, 2.5]}>
                <Link href="/map">
                    <PanoramaButton label="Karte" height="454px">
                        <DarkMiniMap fixed={true} zoom={4} center={{ longitude: 11, latitude: 50 }} />
                    </PanoramaButton>
                </Link>
                <Layout gap="var(--gap-light)">
                    <Link href="https://www.mineralienatlas.de/lexikon/index.php/MediaDataShow?hoch=100&quer=1&sort=Text(a)&bildertyp=&Nutzer=Annhilati">
                        <PanoramaButton label="Bild-Beiträge" height="350px">
                            <img src="https://cdn.prod.website-files.com/660aef02bc8087e5ee782873/661d1f612b2674405c211920_IMG_20240414_173111%5B1%5D.jpg"></img>
                        </PanoramaButton>
                    </Link>
                    <Link href="#"><Button>Kontakt</Button></Link>
                    <Link href="https://discord.com/users/720992368110862407"><Button>Discord</Button></Link>
                </Layout >
            </Layout>
        </div>
    );
}
