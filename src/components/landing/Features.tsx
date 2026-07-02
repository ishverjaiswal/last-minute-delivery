import React from 'react'

const Features = () => {
    return (
        <section
            id="features"
            className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-transparent to-neutral-950"
        >
            <div className="container mx-auto px-4 py-20">
                <h2 className="text-4xl md:text-6xl font-bold text-center mb-16">
                    Foundation for Logistics Workflows
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 rounded-lg bg-neutral-900/50 backdrop-blur-sm border border-neutral-800">
                        <h3 className="text-2xl font-semibold mb-4">
                            Secure Access
                        </h3>
                        <p className="text-neutral-400">
                            Role-based authentication and protected routes keep
                            operations aligned with the right team members.
                        </p>
                    </div>
                    <div className="p-6 rounded-lg bg-neutral-900/50 backdrop-blur-sm border border-neutral-800">
                        <h3 className="text-2xl font-semibold mb-4">
                            Reliable Sessions
                        </h3>
                        <p className="text-neutral-400">
                            Authentication flows are ready for extending into
                            dispatch, tracking, and customer updates.
                        </p>
                    </div>
                    <div className="p-6 rounded-lg bg-neutral-900/50 backdrop-blur-sm border border-neutral-800">
                        <h3 className="text-2xl font-semibold mb-4">
                            Scalable Platform
                        </h3>
                        <p className="text-neutral-400">
                            The project structure is prepared so future
                            logistics modules can be layered on cleanly.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Features
