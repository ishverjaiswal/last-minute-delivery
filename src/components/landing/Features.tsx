import React from 'react'

const Features = () => {
    const featuresList = [
        {
            title: 'Order Management',
            description: 'Create, organize and monitor parcel deliveries from one place.',
            icon: '📦',
        },
        {
            title: 'Delivery Agent Assignment',
            description: 'Assign delivery agents and monitor active deliveries.',
            icon: '🛵',
        },
        {
            title: 'Zone & Rate Management',
            description: 'Configure service zones and pricing rules.',
            icon: '🗺️',
        },
        {
            title: 'Real-Time Tracking',
            description: 'Track order lifecycle from booking to successful delivery.',
            icon: '🎯',
        },
    ]

    return (
        <section id="features" className="w-full bg-black py-24 text-white border-t border-neutral-900">
            <div className="container mx-auto px-6 max-w-6xl space-y-12">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                        Logistics Workflows Built for Speed
                    </h2>
                    <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto">
                        Unified operations to coordinate agents, pricing limits, coverage, and tracking states.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {featuresList.map((feat, idx) => (
                        <div
                            key={`feat-${idx}`}
                            className="p-8 rounded-xl bg-neutral-900/40 border border-neutral-900 hover:border-neutral-800 hover:bg-neutral-900/60 transition-all space-y-4"
                        >
                            <div className="w-12 h-12 rounded-lg bg-neutral-850 border border-neutral-800 flex items-center justify-center text-xl">
                                {feat.icon}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold tracking-tight">{feat.title}</h3>
                                <p className="text-sm text-neutral-400 leading-relaxed">{feat.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Features
