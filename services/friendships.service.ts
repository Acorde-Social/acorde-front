import { API_URL } from "@/lib/api-config"

export interface FriendshipUser {
	id: string
	name: string
	login: string
	avatarUrl: string | null
	role: string
}

export interface Friendship {
	id: string
	requesterId: string
	addresseeId: string
	status: "PENDING" | "ACCEPTED" | "DECLINED" | "BLOCKED"
	createdAt: string
	updatedAt: string
	requester?: FriendshipUser
	addressee?: FriendshipUser
}

export interface FriendshipStatus {
	status: "NONE" | "PENDING" | "ACCEPTED" | "DECLINED" | "BLOCKED" | "SELF" | "NOT_FOUND"
	friendshipId: string | null
	isRequester?: boolean
}

export interface Friend {
	friendshipId: string
	id: string
	name: string
	login: string
	avatarUrl: string | null
	role: string
}

export interface FriendsResponse {
	friends: Friend[]
	pendingCount: number
	suggestionsCount: number
}

export interface FriendSuggestion {
	id: string
	name: string
	login: string
	avatarUrl: string | null
	role: string
	bio?: string
	instruments?: string[]
}

/**
 * Enviar pedido de amizade (fazer acorde)
 */
export async function sendFriendshipRequest(token: string, addresseeLogin: string): Promise<Friendship> {
	const response = await fetch(`${API_URL}/users/friendships`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ addresseeLogin }),
	})

	if (!response.ok) {
		const error = await response.json()
		throw new Error(error.message || "Erro ao enviar pedido de amizade")
	}

	return response.json()
}

/**
 * Aceitar pedido de amizade
 */
export async function acceptFriendship(token: string, friendshipId: string): Promise<Friendship> {
	const response = await fetch(`${API_URL}/users/friendships/${friendshipId}/accept`, {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})

	if (!response.ok) {
		const error = await response.json()
		throw new Error(error.message || "Erro ao aceitar pedido")
	}

	return response.json()
}

/**
 * Recusar pedido de amizade
 */
export async function declineFriendship(token: string, friendshipId: string): Promise<{ message: string }> {
	const response = await fetch(`${API_URL}/users/friendships/${friendshipId}/decline`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})

	if (!response.ok) {
		const error = await response.json()
		throw new Error(error.message || "Erro ao recusar pedido")
	}

	return response.json()
}

/**
 * Remover amizade
 */
export async function removeFriendship(token: string, friendshipId: string): Promise<{ message: string }> {
	const response = await fetch(`${API_URL}/users/friendships/${friendshipId}`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})

	if (!response.ok) {
		const error = await response.json()
		throw new Error(error.message || "Erro ao remover amizade")
	}

	return response.json()
}

/**
 * Listar pedidos de amizade pendentes (recebidos)
 */
export async function getPendingFriendships(token: string): Promise<Friendship[]> {
	const response = await fetch(`${API_URL}/users/friendships/pending`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})

	if (!response.ok) {
		throw new Error("Erro ao buscar pedidos pendentes")
	}

	return response.json()
}

/**
 * Listar todos os amigos + counts de pending e suggestions
 */
export async function getFriends(token: string): Promise<FriendsResponse> {
	const response = await fetch(`${API_URL}/users/friendships`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})

	if (!response.ok) {
		throw new Error("Erro ao buscar amigos")
	}

	return response.json()
}

/**
 * Verificar status de amizade com outro usuário
 */
export async function getFriendshipStatus(token: string, login: string): Promise<FriendshipStatus> {
	const response = await fetch(`${API_URL}/users/friendships/status/${login}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})

	if (!response.ok) {
		throw new Error("Erro ao verificar status de amizade")
	}

	return response.json()
}

/**
 * Obter sugestões de amizade
 */
export async function getFriendshipSuggestions(token: string, limit: number = 10): Promise<FriendSuggestion[]> {
	const response = await fetch(`${API_URL}/users/friendships/suggestions?limit=${limit}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})

	if (!response.ok) {
		throw new Error("Erro ao buscar sugestões")
	}

	return response.json()
}
