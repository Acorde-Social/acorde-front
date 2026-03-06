import { API_URL } from "@/lib/api-config"
import { getAuthToken } from "@/utils/auth"
import { notification } from "@/lib/notification"

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

class NotificationService {
  async getNotifications(
    limit: number = 20,
    unreadOnly: boolean = false,
    customToken?: string
  ): Promise<Notification[]> {
    try {
      const token = customToken || getAuthToken()
      if (!token) {
        notification.error("Você precisa estar logado para ver notificações")
        return []
      }

      const response = await fetch(
        `${API_URL}/api/users/notifications?limit=${limit}&unreadOnly=${unreadOnly}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.status === 401) {
        notification.error("Sessão expirada. Faça login novamente.")
        return []
      }

      if (!response.ok) {
        notification.error("Erro ao buscar notificações")
        return []
      }

      return await response.json()
      
    } catch (error) {
      notification.error("Erro ao carregar notificações. Tente novamente.")
      return []
    }
  }

  async getNotificationCount(customToken?: string): Promise<NotificationCount | null> {
    try {
      const token = customToken || getAuthToken()
      if (!token) {
        return null
      }

      const response = await fetch(`${API_URL}/api/users/notifications/count`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.status === 401) {
        return null
      }

      if (!response.ok) {
        return null
      }

      return await response.json()
      
    } catch (error) {
      return null
    }
  }

  async markNotificationAsRead(notificationId: string, customToken?: string): Promise<Notification | null> {
    try {
      const token = customToken || getAuthToken()
      if (!token) {
        notification.error("Você precisa estar logado")
        return null
      }

      if (!notificationId) {
        notification.error("ID da notificação não fornecido")
        return null
      }

      const response = await fetch(`${API_URL}/api/users/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.status === 404) {
        notification.error("Notificação não encontrada")
        return null
      }

      if (response.status === 401) {
        notification.error("Sessão expirada. Faça login novamente.")
        return null
      }

      if (!response.ok) {
        notification.error("Erro ao marcar notificação como lida")
        return null
      }

      return await response.json()
      
    } catch (error) {
      notification.error("Erro ao processar notificação. Tente novamente.")
      return null
    }
  }

  async markAllNotificationsAsRead(customToken?: string): Promise<boolean> {
    try {
      const token = customToken || getAuthToken()
      if (!token) {
        notification.error("Você precisa estar logado")
        return false
      }

      const response = await fetch(`${API_URL}/api/users/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.status === 401) {
        notification.error("Sessão expirada. Faça login novamente.")
        return false
      }

      if (!response.ok) {
        notification.error("Erro ao marcar notificações como lidas")
        return false
      }

      notification.success("Todas as notificações foram marcadas como lidas")
      return true
      
    } catch (error) {
      notification.error("Erro ao processar notificações. Tente novamente.")
      return false
    }
  }

  async deleteNotification(notificationId: string, customToken?: string): Promise<boolean> {
    try {
      const token = customToken || getAuthToken()
      if (!token) {
        notification.error("Você precisa estar logado")
        return false
      }

      if (!notificationId) {
        notification.error("ID da notificação não fornecido")
        return false
      }

      const response = await fetch(`${API_URL}/api/users/notifications/${notificationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.status === 404) {
        notification.error("Notificação não encontrada")
        return false
      }

      if (response.status === 401) {
        notification.error("Sessão expirada. Faça login novamente.")
        return false
      }

      if (!response.ok) {
        notification.error("Erro ao deletar notificação")
        return false
      }

      notification.success("Notificação removida")
      return true
      
    } catch (error) {
      notification.error("Erro ao deletar notificação. Tente novamente.")
      return false
    }
  }
}

export const notificationService = new NotificationService()