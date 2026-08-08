import Button from "@/components/Button"
import Link from "next/link"
import AsciiBackground from "@/components/AsciiBackground";

export default function Home() {
    return (
        <>
            <div style={{width: "200px"}}>
                <Link href="#"><Button>Kontakt</Button></Link>
            </div>
        </>
    );
}
