import React from 'react'

const HowItWorks = () => {
    const steps = [
        {
            num: '01',
            title: 'Customer Books Delivery',
            desc: 'Calculate pricing instantly based on serviceable PIN codes and package weight brackets.',
        },
        {
            num: '02',
            title: 'Admin Reviews & Assigns Agent',
            desc: 'Dispatcher validates incoming order details and assigns an available driver.',
        },
        {
            num: '03',
            title: 'Delivery Agent Picks Up Parcel',
            desc: 'The designated delivery driver picks up the package and begins the shipment route.',
        },
        {
            num: '04',
            title: 'Customer Tracks Delivery Until Completion',
            desc: 'Get status logs updates at each stage of the lifecycle from confirmation to final handoff.',
        },
    ]

    return (
        <section id="how-it-works" className="w-full bg-black py-24 text-white border-t border-neutral-900">
            <div className="container mx-auto px-6 max-w-5xl space-y-16">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">How It Works</h2>
                    <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto">
                        A seamless, automated dispatch lifecycle from user booking to driver delivery.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {steps.map((step, idx) => (
                        <div key={`step-${idx}`} className="space-y-4 relative">
                            <div className="text-xs font-mono font-bold text-indigo-500 tracking-wider">
                                STEP {step.num}
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold tracking-tight text-neutral-200">{step.title}</h3>
                                <p className="text-xs text-neutral-400 leading-relaxed">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HowItWorks
