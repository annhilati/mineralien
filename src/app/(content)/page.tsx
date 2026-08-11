import Layout from "@/components/Layout"
import Link from "next/link"
import { Button, PanoramaButton } from "@/components/Buttons"
import DarkMiniMap from "@/components/Map/DarkMiniMap";
import { SiDiscord } from '@icons-pack/react-simple-icons';

export default function Home() {
    return (
        <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Layout row ratios={[1, 2.5]}>
                <Link href="/map">
                    <PanoramaButton label="Karte" height="402px">
                        <DarkMiniMap fixed={true} zoom={4} center={{ longitude: 11, latitude: 50 }} variant="schematic" />
                    </PanoramaButton>
                </Link>
                <Layout gap="var(--gap-light)">
                    <Link href="https://www.mineralienatlas.de/lexikon/index.php/MediaDataShow?hoch=100&quer=1&sort=Text(a)&bildertyp=&Nutzer=Annhilati">
                        <PanoramaButton label="Bild-Beiträge" height="350px">
                            <img src="https://cdn.prod.website-files.com/660aef02bc8087e5ee782873/661d1f612b2674405c211920_IMG_20240414_173111%5B1%5D.jpg"></img>
                        </PanoramaButton>
                    </Link>
                    <Link href="https://discord.com/users/720992368110862407"><Button><SiDiscord size="1.18em" style={{ marginRight: '5px' }}/>Kontakt</Button></Link>
                </Layout >
            </Layout>
        </div>
    );
}
