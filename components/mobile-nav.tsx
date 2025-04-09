"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Music } from "lucide-react"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

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
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0">
          <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
            <Music className="h-6 w-6 text-primary" />
            <span className="ml-2 font-bold">MusicCollab</span>
          </Link>
          <nav className="mt-8 flex flex-col space-y-3">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-2 py-1 text-lg font-medium transition-colors hover:text-foreground/80",
                  route.active ? "text-foreground" : "text-foreground/60",
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <Link href="/" className="flex items-center space-x-2">
        <Music className="h-6 w-6 text-primary" />
        <span className="font-bold">MusicCollab</span>
      </Link>
    </div>
  )
}

