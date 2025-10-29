"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeCustomizationProvider } from "@/contexts/theme-context"
import { ChatPopupProvider } from "@/contexts/chat-popup-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"
import { useAuth } from "@/contexts/auth-context"

function LayoutContent({ children }: { children: React.ReactNode }) {
	const { user } = useAuth()

	return (
		<div className="relative flex min-h-screen flex-col">
			<Header />
			<main className={user ? "flex-1 pb-20 md:pb-0" : "flex-1"}>
				{children}
			</main>
			<Footer />
			{user && <MobileBottomNav />}
		</div>
	)
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
	return (
		<AuthProvider>
			<ThemeCustomizationProvider>
				<ThemeProvider>
					<ChatPopupProvider>
						<LayoutContent>
							{children}
						</LayoutContent>
						<Toaster />
					</ChatPopupProvider>
				</ThemeProvider>
			</ThemeCustomizationProvider>
		</AuthProvider>
	)
}