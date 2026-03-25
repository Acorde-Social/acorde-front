"use client"

import React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeCustomizationProvider } from "@/contexts/theme-context"
import { ChatPopupProvider } from "@/contexts/chat-popup-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"

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
	useEffect(() => {
		document.documentElement.classList.add('hydrated')
	}, [])

	useEffect(() => {
		const hasRecovered = sessionStorage.getItem('chunk-recovery-attempted') === '1'

		const triggerRecoveryReload = () => {
			if (!hasRecovered) {
				sessionStorage.setItem('chunk-recovery-attempted', '1')
				window.location.reload()
			}
		}

		const handleErrorEvent = (event: ErrorEvent) => {
			const message = event?.message || ''
			if (message.includes('ChunkLoadError') || message.includes('Loading chunk')) {
				triggerRecoveryReload()
			}
		}

		const handlePromiseRejection = (event: PromiseRejectionEvent) => {
			const reason = String(event?.reason || '')
			if (
				reason.includes('ChunkLoadError') ||
				reason.includes('Loading chunk') ||
				reason.includes('Failed to fetch dynamically imported module')
			) {
				triggerRecoveryReload()
			}
		}

		window.addEventListener('error', handleErrorEvent)
		window.addEventListener('unhandledrejection', handlePromiseRejection)

		return () => {
			window.removeEventListener('error', handleErrorEvent)
			window.removeEventListener('unhandledrejection', handlePromiseRejection)
		}
	}, [])

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
