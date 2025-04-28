import { useThemeCustomization } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"

interface LayoutContainerProps {
	children: React.ReactNode
	className?: string
	fullWidth?: boolean
}

export function LayoutContainer({ children, className, fullWidth = false }: LayoutContainerProps) {
	const { preferences } = useThemeCustomization()

	return (
		<div
			className={cn(
				"w-full mx-auto",
				// apply max-width only when not fullWidth
				!fullWidth && {
					"container": preferences.layout === "default",
					"max-w-5xl px-4": preferences.layout === "compact",
					"max-w-7xl px-6": preferences.layout === "spacious",
				},
				className
			)}
		>
			{children}
		</div>
	)
}