import { Hero } from '@/components/landing/Hero'
import { Navigationbar } from '@/components/landing/Navigationbar'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Stats from '@/components/landing/Stats'
import Contact from '@/components/landing/Contact'
import Footer from '@/components/landing/Footer'

export default function Home() {
    return (
        <div className="relative min-h-screen bg-black select-none">
            <Navigationbar />
            <div className="relative w-full">
                <main className="relative z-10">
                    <Hero />
                    <Features />
                    <HowItWorks />
                    <Stats />
                    <Contact />
                    <Footer />
                </main>
            </div>
        </div>
    )
}
