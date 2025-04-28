"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ThemeConfig, ThemeLayout } from "@/hooks/use-theme-customization"

interface ThemePreviewProps extends Partial<ThemeConfig> { }

export function ThemePreview({
	primaryColor = "#000000",
	secondaryColor = "#3366FF",
	backgroundColor = "#FFFFFF",
	fontFamily = "Arial, Helvetica, sans-serif",
	fontSize = "16px",
	borderRadius = "0.5rem",
	layout = "default"
}: ThemePreviewProps) {
	return (
		<div
			className="rounded-lg border bg-card p-4"
			style={{
				backgroundColor,
				fontFamily,
				fontSize,
				borderRadius
			}}
		>
			<div className={cn(
				"flex items-center gap-4 border-b pb-4 mb-4",
				layout === "compact" ? "gap-2" : layout === "spacious" ? "gap-6" : "gap-4"
			)}>
				<div className="flex items-center gap-2">
					<div
						className="h-6 w-6 rounded"
						style={{ backgroundColor: primaryColor }}
					/>
					<span className="font-medium">Cor Primária</span>
				</div>
				<div className="flex items-center gap-2">
					<div
						className="h-6 w-6 rounded"
						style={{ backgroundColor: secondaryColor }}
					/>
					<span className="font-medium">Cor Secundária</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="font-medium">Layout:</span>
					<span className="text-muted-foreground capitalize">{layout}</span>
				</div>
			</div>

			<div className="space-y-4">
				<Card className={cn(
					layout === "compact" ? "p-3" : layout === "spacious" ? "p-6" : "p-4"
				)} style={{ borderRadius }}>
					<CardHeader className={cn(
						"flex-row items-center justify-between space-y-0 pb-2",
						layout === "compact" ? "pb-1" : layout === "spacious" ? "pb-4" : "pb-2"
					)}>
						<CardTitle className={cn(
							layout === "compact" ? "text-sm" : layout === "spacious" ? "text-xl" : "text-base"
						)}>
							Preview do Layout
						</CardTitle>
						<Button
							size={layout === "compact" ? "sm" : "default"}
							style={{ backgroundColor: primaryColor, borderRadius }}
						>
							Ação Principal
						</Button>
					</CardHeader>
					<CardContent>
						<div className={cn(
							"grid gap-4",
							layout === "compact" ? "grid-cols-2 gap-2" : layout === "spacious" ? "grid-cols-2 gap-6" : "grid-cols-2 gap-4"
						)}>
							<Card className={cn(
								"flex items-center gap-2 p-3",
								layout === "compact" ? "p-2" : layout === "spacious" ? "p-4" : "p-3"
							)} style={{ borderRadius }}>
								<Music className={cn(
									layout === "compact" ? "h-4 w-4" : layout === "spacious" ? "h-6 w-6" : "h-5 w-5"
								)} />
								<div className="space-y-1">
									<p className={cn(
										"font-medium",
										layout === "compact" ? "text-sm" : layout === "spacious" ? "text-lg" : "text-base"
									)}>
										Projetos
									</p>
									<p className={cn(
										"text-muted-foreground",
										layout === "compact" ? "text-xs" : layout === "spacious" ? "text-sm" : "text-xs"
									)}>
										12 ativos
									</p>
								</div>
							</Card>
							<Card className={cn(
								"flex items-center gap-2 p-3",
								layout === "compact" ? "p-2" : layout === "spacious" ? "p-4" : "p-3"
							)} style={{ borderRadius }}>
								<Users className={cn(
									layout === "compact" ? "h-4 w-4" : layout === "spacious" ? "h-6 w-6" : "h-5 w-5"
								)} />
								<div className="space-y-1">
									<p className={cn(
										"font-medium",
										layout === "compact" ? "text-sm" : layout === "spacious" ? "text-lg" : "text-base"
									)}>
										Colaboradores
									</p>
									<p className={cn(
										"text-muted-foreground",
										layout === "compact" ? "text-xs" : layout === "spacious" ? "text-sm" : "text-xs"
									)}>
										8 conectados
									</p>
								</div>
							</Card>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}