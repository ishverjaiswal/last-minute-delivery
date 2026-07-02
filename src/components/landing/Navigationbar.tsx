'use client'
import {
    Navbar,
    NavBody,
    NavItems,
    MobileNav,
    NavbarLogo,
    NavbarButton,
    MobileNavHeader,
    MobileNavToggle,
    MobileNavMenu,
} from '@/components/landing/ui/resizable-navbar'
import { useState } from 'react'
import { LoginButton } from './ui/login-button'
import { ButtonGradient } from '../ui/button-gradient'

export function Navigationbar() {
    const navItems = [
        {
            name: 'Features',
            link: '#features',
        },
        {
            name: 'How It Works',
            link: '#how-it-works',
        },
        {
            name: 'Contact',
            link: '#contact',
        },
    ]

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div
            className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 `}
        >
            <Navbar>
                {/* Desktop Navigation */}
                <NavBody>
                    <NavbarLogo />
                    <NavItems items={navItems} />
                    <div className="flex items-center gap-4">
                        <LoginButton mode="modal" type="login" asChild>
                            <NavbarButton variant="secondary">
                                Login
                            </NavbarButton>
                        </LoginButton>
                        <LoginButton mode="redirect" type="signup">
                            <ButtonGradient
                                containerClassName="rounded-full"
                                as="button"
                                className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
                            >
                                <span>Get Started</span>
                            </ButtonGradient>
                        </LoginButton>
                    </div>
                </NavBody>

                {/* Mobile Navigation */}
                <MobileNav>
                    <MobileNavHeader>
                        <NavbarLogo />
                        <MobileNavToggle
                            isOpen={isMobileMenuOpen}
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                        />
                    </MobileNavHeader>

                    <MobileNavMenu
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                    >
                        {navItems.map((item, idx) => (
                            <a
                                key={`mobile-link-${idx}`}
                                href={item.link}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="relative text-neutral-600 dark:text-neutral-300"
                            >
                                <span className="block">{item.name}</span>
                            </a>
                        ))}
                        <div className="flex w-full flex-col gap-4">
                            <LoginButton mode="redirect" type="login">
                                <NavbarButton
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    variant="primary"
                                    className="w-full"
                                >
                                    Login
                                </NavbarButton>
                            </LoginButton>
                            <LoginButton mode="redirect" type="signup">
                                <NavbarButton
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    variant="primary"
                                    className="w-full"
                                >
                                    <ButtonGradient
                                        containerClassName="rounded-full"
                                        as="button"
                                        className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
                                    >
                                        <span>Get Started</span>
                                    </ButtonGradient>
                                </NavbarButton>
                            </LoginButton>
                        </div>
                    </MobileNavMenu>
                </MobileNav>
            </Navbar>
        </div>
    )
}
