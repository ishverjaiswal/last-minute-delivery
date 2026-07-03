'use client'
import React from 'react'

const Contact = () => {
    return (
        <section
            id="contact"
            className="w-full bg-black py-24 text-white border-t border-neutral-900"
        >
            <div className="container mx-auto px-6 max-w-lg space-y-12">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                        Contact Operations
                    </h2>
                    <p className="text-neutral-400 text-sm">
                        Get in touch with our operations support desk for
                        enterprise integration.
                    </p>
                </div>
                <form
                    className="space-y-4"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <div className="premium-form-group">
                        <label htmlFor="name" className="premium-form-label">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            className="premium-input w-full"
                            placeholder="Your name"
                        />
                    </div>
                    <div className="premium-form-group">
                        <label htmlFor="email" className="premium-form-label">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="premium-input w-full"
                            placeholder="your@email.com"
                        />
                    </div>
                    <div className="premium-form-group">
                        <label htmlFor="message" className="premium-form-label">
                            Message
                        </label>
                        <textarea
                            id="message"
                            rows={4}
                            className="premium-input w-full h-auto p-3"
                            placeholder="How can our dispatch team assist you?"
                        />
                    </div>
                    <button
                        type="submit"
                        className="premium-button-primary w-full cursor-pointer"
                    >
                        Send Inquiry
                    </button>
                </form>
            </div>
        </section>
    )
}

export default Contact
