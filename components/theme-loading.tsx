"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export function ThemeLoading() {
	const [isChanging, setIsChanging] = useState(false)
	const [isInitialLoad, setIsInitialLoad] = useState(true)

	useEffect(() => {
		// Marcar que o carregamento inicial já passou após um pequeno delay
		const timer = setTimeout(() => {
			setIsInitialLoad(false)
		}, 500)

		return () => clearTimeout(timer)
	}, [])

	useEffect(() => {
		const handleThemeChange = () => {
			// Não mostrar loader no carregamento inicial
			if (isInitialLoad) return

			setIsChanging(true)
			setTimeout(() => setIsChanging(false), 300) // Match with CSS transition duration
		}

		document.addEventListener("themeChange", handleThemeChange)
		return () => document.removeEventListener("themeChange", handleThemeChange)
	}, [isInitialLoad])

	if (!isChanging) return null

	return (
		<div className={cn(
			"fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm",
			"transition-opacity duration-300",
			isChanging ? "opacity-100" : "opacity-0 pointer-events-none"
		)}>
			<Loader2 className="h-8 w-8 animate-spin text-primary" />
		</div>
	)
}