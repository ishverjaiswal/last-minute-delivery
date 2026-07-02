'use client'
import React from 'react'

const Contact = () => {
    return (
        <section id="contact" className="w-full bg-black py-24 text-white border-t border-neutral-900">
            <div className="container mx-auto px-6 max-w-lg space-y-12">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Contact Operations</h2>
                    <p className="text-neutral-400 text-sm">
                        Get in touch with our operations support desk for enterprise integration.
                    </p>
                </div>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-1.5">
                        <label htmlFor="name" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            className="w-full h-10 px-3 rounded-md bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-neutral-700"
                            placeholder="Your name"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="w-full h-10 px-3 rounded-md bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-neutral-700"
                            placeholder="your@email.com"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="message" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                            Message
                        </label>
                        <textarea
                            id="message"
                            rows={4}
                            className="w-full p-3 rounded-md bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-neutral-700"
                            placeholder="How can our dispatch team assist you?"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full h-10 bg-white hover:bg-neutral-200 text-black text-sm font-bold rounded-md transition-colors cursor-pointer"
                    >
                        Send Inquiry
                    </button>
                </form>
            </div>
        </section>
    )
}

export default Contact
