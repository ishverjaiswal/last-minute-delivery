import React from 'react'
import Link from 'next/link'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="dark relative min-h-screen bg-black flex flex-col justify-center items-center">
            {/* Header logo */}
            <div className="absolute top-8 left-8 flex items-center space-x-2">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                        L
                    </div>
                    <span className="text-white font-semibold tracking-wider text-sm">
                        LastMile
                    </span>
                </Link>
            </div>

            <div className="w-full flex justify-center items-center">
                {children}
            </div>
        </div>
    )
}

export default AuthLayout
