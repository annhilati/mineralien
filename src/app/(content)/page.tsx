import Layout from "@/components/Layout"
import Link from "next/link"
import { Button, PanoramaButton } from "@/components/Buttons"
import DarkMiniMap from "@/components/Map/DarkMiniMap";


export default function Home() {
    return (
        <>
            <Layout row ratios={[1, 2.5]}>
                <Layout gap="10px">
                    <Link href="/map">
                        <PanoramaButton label="Karte" height="250px">
                            <DarkMiniMap fixed={true} zoom={3.3} center={{ longitude: 12.3481, latitude: 50 }} />
                        </PanoramaButton>
                    </Link>
                    <Link href="#"><Button>Kontakt</Button></Link>
                    <Link href="https://discord.com/users/720992368110862407"><Button>Discord</Button></Link>
                </Layout>
                <Layout>
                    <Link href="https://www.mineralienatlas.de/lexikon/index.php/MediaDataShow?hoch=100&quer=1&sort=Text(a)&bildertyp=&Nutzer=Annhilati">
                        <PanoramaButton label="Bild-Beiträge" height="350px">
                            <img src="https://cdn.prod.website-files.com/660aef02bc8087e5ee782873/661d1f612b2674405c211920_IMG_20240414_173111%5B1%5D.jpg"></img>
                        </PanoramaButton>
                    </Link>
                </Layout >
            </Layout>
        </>
    );
}
