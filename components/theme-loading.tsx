"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export function ThemeLoading() {
	const [isChanging, setIsChanging] = useState(false)

	useEffect(() => {
		const handleThemeChange = () => {
			setIsChanging(true)
			setTimeout(() => setIsChanging(false), 300) // Match with CSS transition duration
		}

		document.addEventListener("themeChange", handleThemeChange)
		return () => document.removeEventListener("themeChange", handleThemeChange)
	}, [])

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