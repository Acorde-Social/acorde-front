"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useThemeCustomization } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"
import { fixImageUrl } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"

export function UserNav() {
	const { user, logout } = useAuth()
	const router = useRouter()
	const pathname = usePathname()
	const { preferences } = useThemeCustomization()

	if (!user) return null

	const isViewingOtherProfile = pathname?.startsWith('/profile/') && pathname !== '/profile'

	return (
		<div className="flex items-center gap-1 sm:gap-2">
			{isViewingOtherProfile && (
				<Button
					variant="ghost"
					size="sm"
					asChild
					className="text-muted-foreground hover:text-foreground h-8 px-2"
				>
					<Link href="/profile">
						<ArrowLeft className="h-4 w-4 sm:mr-1" />
						<span className="hidden sm:inline">Meu Perfil</span>
					</Link>
				</Button>
			)}

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="relative rounded-full p-0 h-8 w-8 sm:h-10 sm:w-10">
						<Avatar className={cn(
							"cursor-pointer transition-opacity hover:opacity-80 aspect-square",
							"h-8 w-8 sm:h-10 sm:w-10",
							preferences.layout === "compact" && "sm:h-8 sm:w-8",
							preferences.layout === "spacious" && "sm:h-12 sm:w-12"
						)}>
							<AvatarImage
								src={fixImageUrl(user.avatarUrl || "")}
								alt={user.name}
								className="object-cover w-full h-full"
							/>
							<AvatarFallback>{user.name[0]}</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56" align="end" forceMount>
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-medium leading-none">{user.name}</p>
							<p className="text-xs leading-none text-muted-foreground">
								{user.email}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem asChild>
							<Link href="/profile">Meu Perfil</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href="/projects">Meus Projetos</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href="/collaborations">Minhas Colaborações</Link>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="text-warning focus:bg-warning/10 focus:text-warning dark:focus:bg-warning/20"
						onClick={() => {
							logout()
							router.push("/")
						}}
					>
						Sair
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}
