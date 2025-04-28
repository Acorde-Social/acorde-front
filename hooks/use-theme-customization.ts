import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"

export type ThemeLayout = "default" | "compact" | "spacious"
export type ThemeColor = string

export interface ThemeConfig {
  primaryColor: ThemeColor
  secondaryColor?: ThemeColor
  backgroundColor?: ThemeColor
  fontFamily?: string
  fontSize?: string
  borderRadius?: string
  layout: ThemeLayout
  [key: string]: any // Permite expansão
}

export function useThemeCustomization() {
  const { user, updateUserTheme } = useAuth()
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    primaryColor: user?.themeConfig?.primaryColor || "#000000",
    secondaryColor: user?.themeConfig?.secondaryColor || "#3366FF",
    backgroundColor: user?.themeConfig?.backgroundColor || "#FFFFFF",
    fontFamily: user?.themeConfig?.fontFamily || "Arial, Helvetica, sans-serif",
    fontSize: user?.themeConfig?.fontSize || "16px",
    borderRadius: user?.themeConfig?.borderRadius || "0.5rem",
    layout: (user?.themeConfig?.layout || "default") as ThemeLayout,
  })

  useEffect(() => {
    if (user?.themeConfig) {
      setThemeConfig({
        ...user.themeConfig,
        primaryColor: user.themeConfig?.primaryColor || "#000000",
        secondaryColor: user.themeConfig?.secondaryColor || "#3366FF",
        backgroundColor: user.themeConfig?.backgroundColor || "#FFFFFF",
        fontFamily: user.themeConfig?.fontFamily || "Arial, Helvetica, sans-serif",
        fontSize: user.themeConfig?.fontSize || "16px",
        borderRadius: user.themeConfig?.borderRadius || "0.5rem",
        layout: user.themeConfig?.layout || "default",
      })
    }
  }, [user?.themeConfig])

  // Atualiza local, contexto e aplica CSS vars
  const updateThemeConfig = (newConfig: Partial<ThemeConfig>) => {
    const updated = { ...themeConfig, ...newConfig }
    setThemeConfig(updated)
    updateUserTheme(updated)
    const root = document.documentElement
    root.classList.remove("layout-default", "layout-compact", "layout-spacious")
    root.classList.add(`layout-${updated.layout}`)
    root.style.setProperty("--primary", updated.primaryColor)
    if (updated.secondaryColor) root.style.setProperty("--secondary", updated.secondaryColor)
    if (updated.backgroundColor) root.style.setProperty("--background", updated.backgroundColor)
    if (updated.fontFamily) root.style.setProperty("--font-family", updated.fontFamily)
    if (updated.fontSize) root.style.setProperty("--font-size", updated.fontSize)
    if (updated.borderRadius) root.style.setProperty("--radius", updated.borderRadius)
  }

  return {
    themeConfig,
    setThemeConfig: updateThemeConfig,
  }
}