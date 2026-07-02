'use client'
import React, { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const UserButton = () => {
    const session = useSession()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true)
        }, 0)
        return () => clearTimeout(timer)
    }, [])

    if (!mounted) {
        return (
            <div className="w-10 h-10 rounded-full bg-neutral-800 animate-pulse" />
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar>
                    <AvatarImage
                        src={session?.data?.user?.image || undefined}
                        alt={`@${session?.data?.user?.name}`}
                    />
                    <AvatarFallback>
                        {session?.data?.user?.name?.charAt(0)}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>
                    {session?.data?.user?.name}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <LogOutButton>Log Out</LogOutButton>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const LogOutButton = ({ children }: { children: React.ReactNode }) => {
    const handleLogout = () => {
        signOut()
    }

    return (
        <span
            onClick={handleLogout}
            className="cursor-pointer hover:underline w-full block"
        >
            {children}
        </span>
    )
}

export default LogOutButton
