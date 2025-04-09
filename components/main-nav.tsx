"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Music, Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Notifications } from "@/components/notifications"

export function MainNav() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const routes = [
    {
      href: "/explore",
      label: "Explorar",
      active: pathname === "/explore",
    },
    {
      href: "/projects",
      label: "Projetos",
      active: pathname === "/projects",
    },
    {
      href: "/studio",
      label: "Estúdio",
      active: pathname === "/studio",
    },
  ]

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Music className="h-6 w-6 text-primary" />
        <span className="hidden font-bold sm:inline-block">MusicCollab</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "transition-colors hover:text-foreground/80",
              route.active ? "text-foreground" : "text-foreground/60",
            )}
          >
            {route.label}
          </Link>
        ))}
      </nav>

      {user && (
        <div className="ml-6">
          <Button asChild variant="outline" size="sm" className="mr-2">
            <Link href="/projects/new">
              <Plus className="mr-1 h-4 w-4" />
              Novo Projeto
            </Link>
          </Button>
        </div>
      )}

      <div className="ml-auto flex items-center space-x-4">
        {user ? (
          <>
            <Notifications />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Meu Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/projects">Meus Projetos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/collaborations">Colaborações</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/collaborations/sent">Minhas Colaborações</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/collaborations/received">Colaborações Recebidas</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Cadastrar</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

