"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useThemeCustomization } from "@/contexts/theme-context"

export function MainNav() {
  const pathname = usePathname()
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
    <nav
      className={cn(
        "flex items-center space-x-4 lg:space-x-6",
        preferences.layout === "compact" && "space-x-2 lg:space-x-4 text-sm",
        preferences.layout === "spacious" && "space-x-6 lg:space-x-8"
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
    </nav>
  )
}