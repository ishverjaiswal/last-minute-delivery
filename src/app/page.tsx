import { Hero } from '@/components/landing/Hero'
import { Navigationbar } from '@/components/landing/Navigationbar'
import { LightRays } from '@/components/ui/light-rays'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Contact from '@/components/landing/Contact'
import Footer from '@/components/landing/Footer'

export default function Home() {
    return (
        <div className="relative min-h-screen">
            <Navigationbar />
            <div className="relative w-full">
                <LightRays className="fixed inset-0 -z-10" />
                <main className="relative z-10">
                    <Hero />
                    <Features />
                    <HowItWorks />
                    <Contact />
                    <Footer />
                </main>
            </div>
        </div>
    )
}
