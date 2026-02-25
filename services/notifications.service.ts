import { API_URL } from "@/lib/api-config"

export type NotificationType =
	| "TRACK_LIKE"
	| "COMMENT_NEW"
	| "COMMENT_LIKE"
	| "COLLABORATION_INVITE"
	| "COLLABORATION_ACCEPTED"
	| "FRIEND_NEW_POST"
	| "SYSTEM_ANNOUNCEMENT"
	| "FRIENDSHIP_REQUEST"

export interface NotificationActor {
	id: string
	name: string
	login: string
	avatarUrl: string | null
}

export interface Notification {
	id: string
	type: NotificationType
	title: string
	message: string
	read: boolean
	recipientId: string
	actorId?: string
	actor?: NotificationActor
	entityType?: string
	entityId?: string
	actionUrl?: string
	createdAt: string
	updatedAt: string
}

export interface NotificationCount {
	unreadCount: number
	totalCount: number
}

/**
 * Buscar notificações do usuário
 */
export async function getNotifications(
	token: string,
	limit: number = 20,
	unreadOnly: boolean = false
): Promise<Notification[]> {
	const response = await fetch(
		`${API_URL}/users/notifications?limit=${limit}&unreadOnly=${unreadOnly}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	)

	if (!response.ok) {
		throw new Error("Erro ao buscar notificações")
	}

	return response.json()
}

/**
 * Contar notificações não lidas
 */
export async function getNotificationCount(token: string): Promise<NotificationCount> {
	const response = await fetch(`${API_URL}/api/users/notifications/count`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})

	if (!response.ok) {
		throw new Error("Erro ao contar notificações")
	}

	return response.json()
}

/**
 * Marcar notificação como lida
 */
export async function markNotificationAsRead(token: string, notificationId: string): Promise<Notification> {
	const response = await fetch(`${API_URL}/users/notifications/${notificationId}/read`, {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})

	if (!response.ok) {
		const error = await response.json()
		throw new Error(error.message || "Erro ao marcar notificação como lida")
	}

	return response.json()
}

/**
 * Marcar todas as notificações como lidas
 */
export async function markAllNotificationsAsRead(token: string): Promise<{ count: number }> {
	const response = await fetch(`${API_URL}/users/notifications/read-all`, {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})

	if (!response.ok) {
		throw new Error("Erro ao marcar todas as notificações")
	}

	return response.json()
}

/**
 * Deletar notificação
 */
export async function deleteNotification(token: string, notificationId: string): Promise<void> {
	const response = await fetch(`${API_URL}/users/notifications/${notificationId}`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})

	if (!response.ok) {
		const error = await response.json()
		throw new Error(error.message || "Erro ao deletar notificação")
	}
}
