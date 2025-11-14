"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useThemeCustomization } from "@/contexts/theme-context"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wrench, FileAudio } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()
  const { preferences } = useThemeCustomization()
  const { user } = useAuth()

  const navItems = [
    {
      href: "/home",
      label: "Início",
    },
    {
      href: "/explore",
      label: "Explorar",
    },
    {
      href: "/projects",
      label: "Projetos",
    },
    {
      href: "/collaborations",
      label: "Colaborações",
    },
    {
      href: "/studio",
      label: "Estúdio",
    },
    // Adicionar link para o chat apenas se o usuário estiver autenticado
    ...(user ? [
      {
        href: "/chat",
        label: "Chat",
      }
    ] : []),
  ]

  const isToolsActive = pathname.startsWith('/tools')

  return (
    <nav
      className={cn(
        "hidden md:flex items-center space-x-4 lg:space-x-6",
        preferences.layout === "compact" && "md:space-x-2 lg:space-x-4 text-sm",
        preferences.layout === "spacious" && "md:space-x-6 lg:space-x-8"
      )}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "transition-colors hover:text-primary",
            pathname === item.href
              ? "text-primary font-medium"
              : "text-muted-foreground",
            preferences.layout === "compact" && "text-sm py-1",
            preferences.layout === "spacious" && "text-base py-2"
          )}
        >
          {item.label}
        </Link>
      ))}

      {/* Menu de Ferramentas - apenas para usuários logados */}
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex items-center gap-1.5 transition-colors hover:text-primary outline-none",
              isToolsActive
                ? "text-primary font-medium"
                : "text-muted-foreground",
              preferences.layout === "compact" && "text-sm py-1",
              preferences.layout === "spacious" && "text-base py-2"
            )}
          >
            <Wrench className="h-4 w-4" />
            Ferramentas
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/tools/audio-converter" className="flex items-center gap-2 cursor-pointer">
                <FileAudio className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">Conversor de Áudio</span>
                  <span className="text-xs text-muted-foreground">Converta para MP3</span>
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  )
}