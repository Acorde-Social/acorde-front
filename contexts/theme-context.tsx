"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { ThemeConfig, ThemeLayout } from "@/hooks/use-theme-customization"
import { useAuth } from "./auth-context"

interface ThemeContextType {
	preferences: Pick<ThemeConfig, 'primaryColor' | 'layout'>
	setPreferences: (newPreferences: Partial<Pick<ThemeConfig, 'primaryColor' | 'layout'>>) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeCustomizationProvider({ children }: { children: ReactNode }) {
	const { user, updateUserTheme } = useAuth()
	const [preferences, setPreferences] = useState<Pick<ThemeConfig, 'primaryColor' | 'layout'>>({
		primaryColor: user?.themeConfig?.primaryColor || "#000000",
		layout: (user?.themeConfig?.layout || "default") as ThemeLayout,
	})

	useEffect(() => {
		if (user?.themeConfig) {
			const newPreferences = {
				primaryColor: user.themeConfig.primaryColor || "#000000",
				layout: user.themeConfig.layout || "default",
			}
			setPreferences(newPreferences)
			applyThemeToDOM(newPreferences)
		}
	}, [user?.themeConfig])

	const applyThemeToDOM = (themePreferences: Pick<ThemeConfig, 'primaryColor' | 'layout'>) => {
		if (typeof window !== "undefined") {
			const root = document.documentElement
			root.classList.remove("layout-default", "layout-compact", "layout-spacious")
			root.classList.add(`layout-${themePreferences.layout}`)
			root.style.setProperty("--primary", themePreferences.primaryColor)
		}
	}

	const updatePreferences = (newPreferences: Partial<Pick<ThemeConfig, 'primaryColor' | 'layout'>>) => {
		const updatedPreferences = {
			...preferences,
			...newPreferences,
		}
		setPreferences(updatedPreferences)
		updateUserTheme(updatedPreferences)
		applyThemeToDOM(updatedPreferences)
	}

	return (
		<ThemeContext.Provider
			value={{
				preferences,
				setPreferences: updatePreferences,
			}}
		>
			{children}
		</ThemeContext.Provider>
	)
}

export function useThemeCustomization() {
	const context = useContext(ThemeContext)
	if (context === undefined) {
		throw new Error("useThemeCustomization deve ser usado dentro de um ThemeCustomizationProvider")
	}
	return context
}