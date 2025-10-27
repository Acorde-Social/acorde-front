"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getNotificationCount } from "@/services/notifications.service"
import { useFriendshipsCounts } from "./use-friendships-data"

interface NotificationCounts {
	notifications: number
	friendships: number
	suggestions: number
	isLoading: boolean
}

/**
 * Hook para gerenciar contadores de notificações e amizades
 * Faz polling automático a cada 30 segundos
 */
export function useNotificationCounts() {
	const { token } = useAuth()
	const friendshipCounts = useFriendshipsCounts()
	const [notificationCount, setNotificationCount] = useState(0)
	const [isLoading, setIsLoading] = useState(false)

	const fetchNotificationCount = useCallback(async () => {
		if (!token) return

		try {
			const notifCount = await getNotificationCount(token)
			setNotificationCount(notifCount.unreadCount)
		} catch (error) {
			console.error("Error fetching notification count:", error)
		}
	}, [token])

	// Buscar contador ao montar e quando o token mudar
	useEffect(() => {
		if (token) {
			setIsLoading(true)
			fetchNotificationCount().finally(() => setIsLoading(false))
		}
	}, [token, fetchNotificationCount])

	// Polling automático a cada 30 segundos
	useEffect(() => {
		if (!token) return

		const interval = setInterval(() => {
			fetchNotificationCount()
			friendshipCounts.refetch()
		}, 30000) // 30 segundos

		return () => clearInterval(interval)
	}, [token, fetchNotificationCount, friendshipCounts])

	const refetch = useCallback(async () => {
		await fetchNotificationCount()
		friendshipCounts.refetch()
	}, [fetchNotificationCount, friendshipCounts])

	return {
		notifications: notificationCount,
		friendships: friendshipCounts.pendingCount,
		suggestions: friendshipCounts.suggestionsCount,
		isLoading: isLoading || friendshipCounts.isLoading,
		refetch,
	}
}
