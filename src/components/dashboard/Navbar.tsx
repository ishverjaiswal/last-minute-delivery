'use client'

import { signOutUser } from '@/lib/helpers/signOut'
import { UserButton } from '../../lib/helpers/log-out-button'
import useCurrentUser from '@/lib/hooks/useCurrentUser'
import Link from 'next/link'

const Navbar = () => {
    const user = useCurrentUser()
    const role = user?.role

    return (
        <nav className="w-full flex items-center justify-between px-6 py-4 bg-black/90 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-50">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">L</div>
                <span className="text-white font-semibold tracking-wider">LastMile</span>
            </div>

            <div className="flex items-center space-x-6">
                <Link href="/dashboard" className="text-neutral-300 hover:text-white transition-colors text-sm font-medium">
                    Dashboard
                </Link>

                {role === 'ADMIN' && (
                    <>
                        <Link href="/orders" className="text-neutral-300 hover:text-white transition-colors text-sm font-medium">
                            Orders
                        </Link>
                        <Link href="/agents" className="text-neutral-300 hover:text-white transition-colors text-sm font-medium">
                            Agents
                        </Link>
                        <Link href="/zones" className="text-neutral-300 hover:text-white transition-colors text-sm font-medium">
                            Zones
                        </Link>
                        <Link href="/rate-cards" className="text-neutral-300 hover:text-white transition-colors text-sm font-medium">
                            Rate Cards
                        </Link>
                    </>
                )}

                {role === 'CUSTOMER' && (
                    <>
                        <Link href="/orders" className="text-neutral-300 hover:text-white transition-colors text-sm font-medium">
                            My Orders
                        </Link>
                        <Link href="/orders/create" className="text-neutral-300 hover:text-white transition-colors text-sm font-medium">
                            Create Order
                        </Link>
                    </>
                )}

                <Link href="/settings" className="text-neutral-300 hover:text-white transition-colors text-sm font-medium">
                    Settings
                </Link>
            </div>

            <div className="flex items-center space-x-4">
                <UserButton />
                <button
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors cursor-pointer"
                    onClick={signOutUser}
                >
                    Sign Out
                </button>
            </div>
        </nav>
    )
}

export default Navbar
