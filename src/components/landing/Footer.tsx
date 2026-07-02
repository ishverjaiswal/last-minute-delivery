import React from 'react'
import Link from 'next/link'

const Footer = () => {
    return (
        <footer className="bg-black border-t border-neutral-900 text-white py-16">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                                L
                            </div>
                            <span className="text-white font-semibold tracking-wider text-sm">LastMile</span>
                        </div>
                        <p className="text-neutral-500 text-xs leading-relaxed max-w-xs">
                            Manage parcel deliveries, assign agents, and monitor active orders from booking to delivery.
                        </p>
                    </div>

                    {/* Links Column 1: Product */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Product</h4>
                        <ul className="space-y-2.5 text-xs text-neutral-500 font-medium">
                            <li>
                                <a href="#features" className="hover:text-neutral-300 transition-colors">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a href="#how-it-works" className="hover:text-neutral-300 transition-colors">
                                    How It Works
                                </a>
                            </li>
                            <li>
                                <Link href="/dashboard" className="hover:text-neutral-300 transition-colors">
                                    Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Links Column 2: Resources */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Resources</h4>
                        <ul className="space-y-2.5 text-xs text-neutral-500 font-medium">
                            <li>
                                <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-neutral-300 transition-colors">
                                    GitHub
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-neutral-300 transition-colors">
                                    Documentation
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Links Column 3: Assignment */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Developer</h4>
                        <ul className="space-y-2.5 text-xs text-neutral-500 font-medium">
                            <li>
                                <span className="text-neutral-500">Developer Assignment</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom section */}
                <div className="border-t border-neutral-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-600 font-medium">
                    <p>&copy; {new Date().getFullYear()} Last Mile Delivery Tracker. All rights reserved.</p>
                    <p>Built for the logistics software engineering assignment.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
