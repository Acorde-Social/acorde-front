"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Wrench, FileAudio, ChevronDown } from "lucide-react"
import { useThemeCustomization } from "@/contexts/theme-context"
import { useAuth } from "@/contexts/auth-context"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const { preferences } = useThemeCustomization()
  const { user } = useAuth()

  const navItems = [
    {
      href: "/",
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
    <div className="md:hidden flex items-center gap-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[80vw] max-w-sm">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <span className="font-bold text-lg">Acorde</span>
          </Link>
          <nav className={cn(
            "flex flex-col space-y-4 mt-4",
            preferences.layout === "compact" && "space-y-2",
            preferences.layout === "spacious" && "space-y-6"
          )}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
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
              <Collapsible open={toolsOpen} onOpenChange={setToolsOpen}>
                <CollapsibleTrigger
                  className={cn(
                    "flex items-center justify-between w-full transition-colors hover:text-primary",
                    isToolsActive
                      ? "text-primary font-medium"
                      : "text-muted-foreground",
                    preferences.layout === "compact" && "text-sm py-1",
                    preferences.layout === "spacious" && "text-base py-2"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    <span>Ferramentas</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      toolsOpen && "transform rotate-180"
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 pt-2 space-y-2">
                  <Link
                    href="/tools/audio-converter"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 transition-colors hover:text-primary py-1",
                      pathname === "/tools/audio-converter"
                        ? "text-primary font-medium"
                        : "text-muted-foreground",
                      preferences.layout === "compact" && "text-sm",
                      preferences.layout === "spacious" && "text-base"
                    )}
                  >
                    <FileAudio className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Conversor de Áudio</div>
                      <div className="text-xs text-muted-foreground">Converta para MP3</div>
                    </div>
                  </Link>
                </CollapsibleContent>
              </Collapsible>
            )}
          </nav>
        </SheetContent>
      </Sheet>
      <Link href="/" className="flex items-center">
        <span className="font-bold text-sm sm:text-base">Acorde</span>
      </Link>
    </div>
  )
}