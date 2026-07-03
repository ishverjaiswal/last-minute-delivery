'use client'

import { signOutUser } from '@/lib/helpers/signOut'
import { UserButton } from '../../lib/helpers/log-out-button'
import useCurrentUser from '@/lib/hooks/useCurrentUser'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navLinkClass = (active: boolean) =>
    cn(
        'text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm px-2 py-1',
        active ? 'text-white' : 'text-neutral-300 hover:text-white'
    )

const Navbar = () => {
    const user = useCurrentUser()
    const role = user?.role
    const pathname = usePathname()

    const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

    return (
        <nav
            className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-neutral-800 bg-black/90 px-6 py-4 backdrop-blur-md"
            aria-label="Main navigation"
        >
            <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
                    L
                </div>
                <span className="font-semibold tracking-wider text-white">LastMile</span>
            </div>

            <div className="flex items-center space-x-4">
                <Link href="/dashboard" className={navLinkClass(isActive('/dashboard'))}>
                    Dashboard
                </Link>

                {role === 'ADMIN' && (
                    <>
                        <Link href="/orders" className={navLinkClass(isActive('/orders'))}>
                            Orders
                        </Link>
                        <Link href="/agents" className={navLinkClass(isActive('/agents'))}>
                            Agents
                        </Link>
                        <Link href="/zones" className={navLinkClass(isActive('/zones'))}>
                            Zones
                        </Link>
                        <Link href="/rate-cards" className={navLinkClass(isActive('/rate-cards'))}>
                            Rate Cards
                        </Link>
                    </>
                )}

                {role === 'CUSTOMER' && (
                    <>
                        <Link href="/orders" className={navLinkClass(isActive('/orders'))}>
                            My Orders
                        </Link>
                        <Link href="/orders/create" className={navLinkClass(isActive('/orders/create'))}>
                            Create Order
                        </Link>
                    </>
                )}

                {role === 'DELIVERY_AGENT' && (
                    <>
                        <Link href="/orders" className={navLinkClass(isActive('/orders') && !isActive('/delivery-history'))}>
                            My Deliveries
                        </Link>
                        <Link href="/delivery-history" className={navLinkClass(isActive('/delivery-history'))}>
                            Delivery History
                        </Link>
                        <Link href="/profile" className={navLinkClass(isActive('/profile'))}>
                            Profile
                        </Link>
                    </>
                )}

                <Link href="/settings" className={navLinkClass(isActive('/settings'))}>
                    Settings
                </Link>
            </div>

            <div className="flex items-center space-x-4">
                <UserButton />
                <button
                    type="button"
                    className="premium-button-secondary h-9 text-xs"
                    onClick={signOutUser}
                >
                    Sign Out
                </button>
            </div>
        </nav>
    )
}

export default Navbar
