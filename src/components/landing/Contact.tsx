import React from 'react'

const Contact = () => {
    return (
        <section
            id="contact"
            className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-neutral-950 to-black"
        >
            <div className="container mx-auto px-4 py-20">
                <h2 className="text-4xl md:text-6xl font-bold text-center mb-16">
                    Contact Us
                </h2>
                <div className="max-w-2xl mx-auto">
                    <form className="space-y-6">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium mb-2"
                            >
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                className="w-full px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                placeholder="Your name"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium mb-2"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="w-full px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                placeholder="your@email.com"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="message"
                                className="block text-sm font-medium mb-2"
                            >
                                Message
                            </label>
                            <textarea
                                id="message"
                                rows={5}
                                className="w-full px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                placeholder="Your message"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </section>
    )
}

export default Contact
