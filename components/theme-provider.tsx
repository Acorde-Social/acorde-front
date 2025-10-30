"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useThemeCustomization } from "@/contexts/theme-context"
import { ThemeLoading } from "./theme-loading"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { preferences } = useThemeCustomization()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return

    // Apply layout classes when component mounts or preferences change
    const root = document.documentElement
    root.classList.remove("layout-default", "layout-compact", "layout-spacious")
    root.classList.add(`layout-${preferences.layout}`)

    // Apply primary color
    root.style.setProperty("--primary", preferences.primaryColor)

    // Dispatch theme change event for loading overlay (only after initial mount)
    const event = new CustomEvent("themeChange")
    document.dispatchEvent(event)
  }, [preferences, mounted])

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="theme"
      {...props}
    >
      <ThemeLoading />
      {children}
    </NextThemesProvider>
  )
}
