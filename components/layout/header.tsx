"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useThemeCustomization } from "@/contexts/theme-context"
import { MainNav } from "./main-nav"
import { MobileNav } from "./mobile-nav"
import { ThemeToggle } from "../theme-toggle"
import { Notifications } from "../notifications"
import { FriendshipNotifications } from "./friendship-notifications"
import { UserNav } from "./user-nav"
import { UserSearch } from "./user-search"
import { cn } from "@/lib/utils"

export function Header() {
	const { user } = useAuth()
	const { preferences } = useThemeCustomization()

	return (
		<header className={cn(
			"sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
			"!h-14 md:!h-16",
			preferences.layout === "compact" && "md:!h-14",
			preferences.layout === "spacious" && "md:!h-20"
		)}>
			<div className={cn(
				"w-full flex h-full items-center justify-between",
				"px-3 sm:px-4 md:px-6 lg:px-8",
				"gap-2 md:gap-3",
				preferences.layout === "compact" && "md:gap-2",
				preferences.layout === "spacious" && "md:gap-6"
			)}>
				<div className="flex items-center gap-2 md:gap-3">
					<MobileNav />
					<Link href="/" className="hidden md:block">
						<span className={cn(
							"font-bold",
							preferences.layout === "compact" ? "text-sm" : preferences.layout === "spacious" ? "text-lg" : "text-base"
						)}>Acorde</span>
					</Link>
					<MainNav />
				</div>
				<div className="flex items-center gap-1 sm:gap-2">
					<UserSearch />
					<ThemeToggle />
					{user ? (
						<>
							<FriendshipNotifications />
							<Notifications />
							<UserNav />
						</>
					) : (
						<div className="flex items-center gap-1 sm:gap-2">
							{/* Desktop/tablet: Entrar */}
							<Button asChild variant="ghost" size="sm" className="hidden sm:flex h-8 px-2">
								<Link href="/login">Entrar</Link>
							</Button>

							{/* Registrar / Criar Conta - mostra "Criar" no mobile */}
							<Button asChild size="sm" className="h-8 px-3">
								<Link href="/register">
									<span className="hidden sm:inline">Criar Conta</span>
									<span className="sm:hidden">Criar</span>
								</Link>
							</Button>

							{/* Mobile-only: Entrar (link separado para evitar confusão) */}
							<Button asChild variant="ghost" size="sm" className="sm:hidden h-8 px-2">
								<Link href="/login">Entrar</Link>
							</Button>
						</div>
					)}
				</div>
			</div>
		</header>
	)
}