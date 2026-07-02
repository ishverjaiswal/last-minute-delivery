import BlurText from '@/components/landing/ui/hero-text'
import { HeroVideoDialog } from '@/components/landing/ui/hero-video-dialog'
import ShinyText from '@/components/landing/ui/hero-subtext'

export const Hero = () => {
    return (
        <section className="min-h-screen pt-30 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-8 py-32 px-4 sm:px-8 lg:px-16">
                <BlurText
                    text="Visibility for every delivery stop."
                    delay={150}
                    animateBy="words"
                    direction="top"
                    className="text-4xl md:text-6xl font-bold text-center"
                />
                <ShinyText
                    text="Secure operations for modern last-mile teams."
                    disabled={false}
                    speed={3}
                    className="custom-class"
                />
            </div>
            <div className=" relative w-full max-w-2xl mx-auto pb-20">
                <HeroVideoDialog
                    className="block dark:hidden"
                    animationStyle="top-in-bottom-out"
                    videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
                    thumbnailSrc="https://startup-template-sage.vercel.app/hero-light.png"
                    thumbnailAlt="Hero Video"
                />
                <HeroVideoDialog
                    className="hidden dark:block"
                    animationStyle="top-in-bottom-out"
                    videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
                    thumbnailSrc="https://startup-template-sage.vercel.app/hero-dark.png"
                    thumbnailAlt="Hero Video"
                />
            </div>
        </section>
    )
}
