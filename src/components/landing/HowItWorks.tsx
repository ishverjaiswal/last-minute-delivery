import React from 'react'

const HowItWorks = () => {
    return (
        <section
            id="how-it-works"
            className="min-h-screen w-full flex items-center justify-center bg-neutral-950"
        >
            <div className="container mx-auto px-4 py-20">
                <h2 className="text-4xl md:text-6xl font-bold text-center mb-16">
                    How It Works
                </h2>
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="flex items-start gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">
                            1
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold mb-2">
                                Step One
                            </h3>
                            <p className="text-neutral-400">
                                Get started with our amazing platform
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">
                            2
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold mb-2">
                                Step Two
                            </h3>
                            <p className="text-neutral-400">
                                Configure your settings and preferences
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">
                            3
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold mb-2">
                                Step Three
                            </h3>
                            <p className="text-neutral-400">
                                Start achieving amazing results
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HowItWorks
