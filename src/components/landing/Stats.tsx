import React from 'react'

const Stats = () => {
    const statsList = [
        {
            value: '1.2M+',
            label: 'Orders Managed',
            desc: 'Successful dispatches processed',
        },
        {
            value: '99.8%',
            label: 'Delivery Success',
            desc: 'Completed on-time handoffs',
        },
        {
            value: '450+',
            label: 'Active Delivery Agents',
            desc: 'Onboarded logistics couriers',
        },
        {
            value: '85+',
            label: 'Service Zones',
            desc: 'PIN code coverage networks',
        },
    ]

    return (
        <section className="w-full bg-black py-24 text-white border-t border-neutral-900">
            <div className="container mx-auto px-6 max-w-5xl space-y-16">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Built to Scale</h2>
                    <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto">
                        Performance benchmarks mapping reliable operations across multiple service regions.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {statsList.map((stat, idx) => (
                        <div key={`stat-${idx}`} className="text-center space-y-2 p-6 rounded-xl bg-neutral-900/30 border border-neutral-900 hover:border-neutral-800 transition-all">
                            <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-indigo-500">
                                {stat.value}
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold tracking-tight text-neutral-200">{stat.label}</p>
                                <p className="text-[10px] text-neutral-500 font-medium">{stat.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Stats
