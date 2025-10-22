"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useThemeCustomization } from "@/contexts/theme-context"
import { MainNav } from "./main-nav"
import { MobileNav } from "./mobile-nav"
import { ThemeToggle } from "../theme-toggle"
import { Notifications } from "../notifications"
import { UserNav } from "./user-nav"
import { cn } from "@/lib/utils"

export function Header() {
	const { user } = useAuth()
	const { preferences } = useThemeCustomization()

	return (
		<header className={cn(
			"sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
			preferences.layout === "compact" ? "h-14" : preferences.layout === "spacious" ? "h-20" : "h-16"
		)}>
			<div className={cn(
				"container flex h-full items-center",
				preferences.layout === "compact" ? "gap-2" : preferences.layout === "spacious" ? "gap-6" : "gap-4"
			)}>
				<MobileNav />
				<Link href="/" className="hidden md:block">
					<div className="flex items-center gap-2">
						<Avatar className={cn(
							"rounded-lg",
							preferences.layout === "compact" ? "h-8 w-8" : preferences.layout === "spacious" ? "h-12 w-12" : "h-10 w-10"
						)}>
							<div className="flex items-center justify-center w-full h-full bg-primary text-primary-foreground font-bold">
								MC
							</div>
						</Avatar>
						<span className={cn(
							"font-bold",
							preferences.layout === "compact" ? "text-sm" : preferences.layout === "spacious" ? "text-lg" : "text-base"
						)}>Acorde</span>
					</div>
				</Link>
				<MainNav />
				<div className="flex items-center gap-2 ml-auto">
					<ThemeToggle />
					{user ? (
						<>
							<Notifications />
							<UserNav />
						</>
					) : (
						<div className="flex items-center gap-2">
							<Button asChild variant="ghost" size={preferences.layout === "compact" ? "sm" : "default"}>
								<Link href="/login">Entrar</Link>
							</Button>
							<Button asChild size={preferences.layout === "compact" ? "sm" : "default"}>
								<Link href="/register">Criar Conta</Link>
							</Button>
						</div>
					)}
				</div>
			</div>
		</header>
	)
}