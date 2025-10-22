"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useThemeCustomization } from "@/contexts/theme-context"
import { Avatar } from "@/components/ui/avatar"

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { preferences } = useThemeCustomization()

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
  ]

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size={preferences.layout === "compact" ? "sm" : "default"}
            className={cn(
              "md:hidden",
              preferences.layout === "spacious" && "text-lg p-6"
            )}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[80vw] max-w-sm">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <Avatar className={cn(
              "rounded-lg",
              preferences.layout === "compact" ? "h-8 w-8" : "h-10 w-10"
            )}>
              <div className="flex items-center justify-center w-full h-full bg-primary text-primary-foreground font-bold">
                MC
              </div>
            </Avatar>
            <span className={cn(
              "font-bold",
              preferences.layout === "compact" ? "text-sm" : "text-base"
            )}>Acorde</span>
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
          </nav>
        </SheetContent>
      </Sheet>
      <Link href="/" className="flex items-center gap-2">
        <Avatar className={cn(
          "rounded-lg",
          preferences.layout === "compact" ? "h-8 w-8" : "h-10 w-10"
        )}>
          <div className="flex items-center justify-center w-full h-full bg-primary text-primary-foreground font-bold">
            MC
          </div>
        </Avatar>
        <span className={cn(
          "font-bold",
          preferences.layout === "compact" ? "text-sm" : "text-base"
        )}>Acorde</span>
      </Link>
    </div>
  )
}