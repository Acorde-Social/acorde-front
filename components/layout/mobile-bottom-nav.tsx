"use client"

import { Home, Search, PlusCircle, Disc3, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { fixImageUrl } from "@/lib/utils"
import { cn } from "@/lib/utils"

export function MobileBottomNav() {
	const pathname = usePathname()
	const { user } = useAuth()

	const navItems = [
		{
			icon: Home,
			label: "Início",
			href: "/home",
			isActive: pathname === "/home"
		},
		{
			icon: Search,
			label: "Explorar",
			href: "/explore",
			isActive: pathname === "/explore"
		},
		{
			icon: PlusCircle,
			label: "Criar",
			href: "/create",
			isActive: pathname === "/create",
			isCenter: true
		},
		{
			icon: Disc3,
			label: "Gravações",
			href: "/studio",
			isActive: pathname === "/studio"
		},
		{
			icon: User,
			label: "Perfil",
			href: "/profile",
			isActive: pathname === "/profile",
			isAvatar: true
		}
	]

	return (
		<div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
			<nav className="flex items-center justify-around h-16 px-2">
				{navItems.map((item) => (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							"flex flex-col items-center justify-center gap-1 relative transition-all duration-200 flex-1",
							item.isCenter && "transform -translate-y-2"
						)}
					>
						{item.isCenter ? (
							// Botão central de criar - destaque especial
							<div className={cn(
								"flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 border-2",
								item.isActive
									? "bg-foreground dark:bg-primary text-background dark:text-primary-foreground border-foreground dark:border-primary shadow-lg shadow-foreground/30 dark:shadow-primary/50 scale-110"
									: "bg-foreground dark:bg-primary text-background dark:text-primary-foreground border-foreground dark:border-primary hover:scale-105 shadow-md"
							)}>
								<item.icon className="h-7 w-7" strokeWidth={2.5} />
							</div>
						) : item.isAvatar ? (
							// Avatar do usuário
							<div className={cn(
								"flex flex-col items-center justify-center gap-1",
								item.isActive && "scale-110"
							)}>
								<Avatar className={cn(
									"h-7 w-7 aspect-square transition-all duration-200",
									item.isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background"
								)}>
									<AvatarImage
										src={fixImageUrl(user?.avatarUrl || "")}
										alt={user?.name || ""}
										className="object-cover w-full h-full"
									/>
									<AvatarFallback className="bg-primary text-primary-foreground text-xs">
										{user?.name?.charAt(0) || "U"}
									</AvatarFallback>
								</Avatar>
								<span className={cn(
									"text-[10px] font-medium transition-colors duration-200",
									item.isActive ? "text-primary" : "text-muted-foreground"
								)}>
									{item.label}
								</span>
							</div>
						) : (
							// Outros ícones
							<div className="flex flex-col items-center justify-center gap-1">
								<item.icon
									className={cn(
										"h-6 w-6 transition-all duration-200",
										item.isActive
											? "text-primary scale-110"
											: "text-muted-foreground"
									)}
									strokeWidth={item.isActive ? 2.5 : 2}
								/>
								<span className={cn(
									"text-[10px] font-medium transition-colors duration-200",
									item.isActive ? "text-primary" : "text-muted-foreground"
								)}>
									{item.label}
								</span>
							</div>
						)}

						{/* Indicador ativo (ponto) */}
						{item.isActive && !item.isCenter && (
							<div className="absolute -top-1 w-1 h-1 rounded-full bg-primary animate-pulse" />
						)}
					</Link>
				))}
			</nav>
		</div>
	)
}
