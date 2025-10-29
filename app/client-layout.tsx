"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeCustomizationProvider } from "@/contexts/theme-context"
import { ChatPopupProvider } from "@/contexts/chat-popup-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export function ClientLayout({ children }: { children: React.ReactNode }) {
	return (
		<AuthProvider>
			<ThemeCustomizationProvider>
				<ThemeProvider>
					<ChatPopupProvider>
						<div className="relative flex min-h-screen flex-col">
							<Header />
							<main className="flex-1">
								{children}
							</main>
							<Footer />
						</div>
						<Toaster />
					</ChatPopupProvider>
				</ThemeProvider>
			</ThemeCustomizationProvider>
		</AuthProvider>
	)
}