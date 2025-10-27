"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
	getFriends,
	getPendingFriendships,
	getFriendshipSuggestions,
	type Friend,
	type Friendship,
	type FriendSuggestion,
	type FriendsResponse,
} from "@/services/friendships.service"

interface FriendshipsData {
	friends: Friend[]
	pending: Friendship[]
	suggestions: FriendSuggestion[]
	pendingCount: number
	suggestionsCount: number
	isLoading: boolean
}

let cachedData: FriendshipsData | null = null
let lastFetch: number = 0
let fetchPromise: Promise<void> | null = null
const CACHE_DURATION = 5000 // 5 segundos

/**
 * Hook para gerenciar dados de amizades com cache compartilhado
 * Evita chamadas duplicadas usando cache global
 */
export function useFriendshipsData(fetchFullLists: boolean = false) {
	const { token } = useAuth()
	const [data, setData] = useState<FriendshipsData>({
		friends: [],
		pending: [],
		suggestions: [],
		pendingCount: 0,
		suggestionsCount: 0,
		isLoading: false,
	})

	const fetchData = useCallback(
		async (force: boolean = false) => {
			if (!token) return

			const now = Date.now()
			const cacheValid = cachedData && now - lastFetch < CACHE_DURATION

			// Se o cache é válido e não é force, usar cache
			if (!force && cacheValid && cachedData) {
				setData(cachedData)
				return
			}

			// Se já tem uma requisição em andamento, aguardar
			if (fetchPromise) {
				await fetchPromise
				if (cachedData) {
					setData(cachedData)
				}
				return
			}

			setData((prev) => ({ ...prev, isLoading: true }))

			// Criar promise de fetch
			fetchPromise = (async () => {
				try {
					// Sempre buscar friends (que traz os counts)
					const friendsData: FriendsResponse = await getFriends(token)

					let pendingList: Friendship[] = []
					let suggestionsList: FriendSuggestion[] = []

					// Se precisar das listas completas (página /friends)
					if (fetchFullLists) {
						const [pending, suggestions] = await Promise.all([
							getPendingFriendships(token),
							getFriendshipSuggestions(token),
						])
						pendingList = pending
						suggestionsList = suggestions
					}

					const newData: FriendshipsData = {
						friends: friendsData.friends,
						pending: pendingList,
						suggestions: suggestionsList,
						pendingCount: friendsData.pendingCount,
						suggestionsCount: friendsData.suggestionsCount,
						isLoading: false,
					}

					cachedData = newData
					lastFetch = Date.now()
					setData(newData)
				} catch (error) {
					console.error("Error fetching friendships data:", error)
					setData((prev) => ({ ...prev, isLoading: false }))
				} finally {
					fetchPromise = null
				}
			})()

			await fetchPromise
		},
		[token, fetchFullLists]
	)

	// Buscar dados ao montar
	useEffect(() => {
		if (token) {
			fetchData()
		}
	}, [token, fetchData])

	return {
		...data,
		refetch: () => fetchData(true),
	}
}

/**
 * Hook simples que só retorna os counts (para polling)
 */
export function useFriendshipsCounts() {
	const { token } = useAuth()
	const [counts, setCounts] = useState({
		pendingCount: 0,
		suggestionsCount: 0,
		isLoading: false,
	})

	const fetchCounts = useCallback(async () => {
		if (!token) return

		try {
			const friendsData = await getFriends(token)
			setCounts({
				pendingCount: friendsData.pendingCount,
				suggestionsCount: friendsData.suggestionsCount,
				isLoading: false,
			})
		} catch (error) {
			console.error("Error fetching friendship counts:", error)
			setCounts((prev) => ({ ...prev, isLoading: false }))
		}
	}, [token])

	useEffect(() => {
		if (token) {
			fetchCounts()
		}
	}, [token, fetchCounts])

	return {
		...counts,
		refetch: fetchCounts,
	}
}
