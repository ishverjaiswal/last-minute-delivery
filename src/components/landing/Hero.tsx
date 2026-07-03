import { LoginButton } from './ui/login-button'

export const Hero = () => {
    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 py-24 bg-black text-white">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Badge/Announce */}
                <div className="inline-flex items-center space-x-2 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-1.5 text-xs text-neutral-300 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Real-time logistics coordination platform</span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-none">
                    Last Mile Delivery Tracker
                </h1>

                {/* Subheading */}
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-400 font-normal leading-relaxed">
                    Manage parcel deliveries, assign delivery agents, calculate
                    shipping costs, and track every order from booking to
                    delivery through a single unified dashboard.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <LoginButton mode="redirect" type="signup">
                        <button className="w-full sm:w-auto bg-white hover:bg-neutral-200 text-black px-8 py-3.5 rounded-lg text-sm font-bold transition-all shadow-lg cursor-pointer">
                            Book Delivery
                        </button>
                    </LoginButton>
                    <LoginButton mode="redirect" type="login">
                        <button className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 px-8 py-3.5 rounded-lg text-sm font-bold transition-all cursor-pointer">
                            View Dashboard
                        </button>
                    </LoginButton>
                </div>
            </div>
        </section>
    )
}
