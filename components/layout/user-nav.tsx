"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
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

export function UserNav() {
	const { user, logout } = useAuth()
	const router = useRouter()
	const { preferences } = useThemeCustomization()

	if (!user) return null

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="relative h-10 w-10 rounded-full">
					<Avatar className={cn(
						"cursor-pointer transition-opacity hover:opacity-80",
						preferences.layout === "compact" ? "h-8 w-8" : preferences.layout === "spacious" ? "h-12 w-12" : "h-10 w-10"
					)}>
						<AvatarImage src={user.avatarUrl || ""} alt={user.name} />
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
					className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950"
					onClick={() => {
						logout()
						router.push("/")
					}}
				>
					Sair
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}