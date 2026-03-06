import { API_URL } from "@/lib/api-config"
import { getAuthToken } from "@/utils/auth"
import { notification } from "@/lib/notification"

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

class FriendshipService {
  async sendFriendshipRequest(addresseeLogin: string, customToken?: string): Promise<Friendship | null> {
    try {
      const token = customToken || getAuthToken()
      if (!token) {
        notification.error("Você precisa estar logado para enviar pedidos")
        return null
      }

      if (!addresseeLogin) {
        notification.error("Login do usuário não fornecido")
        return null
      }

      const response = await fetch(`${API_URL}/api/users/friendships`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ addresseeLogin }),
      })

      if (response.status === 404) {
        notification.error("Usuário não encontrado")
        return null
      }

      if (response.status === 400) {
        const error = await response.json()
        notification.error(error.message || "Não foi possível enviar o pedido")
        return null
      }

      if (response.status === 401) {
        notification.error("Sessão expirada. Faça login novamente.")
        return null
      }

      if (!response.ok) {
        notification.error("Erro ao enviar pedido de amizade")
        return null
      }

      notification.success("Pedido de amizade enviado!")
      return await response.json()
      
    } catch (error) {
      notification.error("Erro ao enviar pedido. Tente novamente.")
      return null
    }
  }

  async acceptFriendship(friendshipId: string, customToken?: string): Promise<Friendship | null> {
    try {
      const token = customToken || getAuthToken()
      if (!token) {
        notification.error("Você precisa estar logado para aceitar pedidos")
        return null
      }

      if (!friendshipId) {
        notification.error("ID da amizade não fornecido")
        return null
      }

      const response = await fetch(`${API_URL}/api/users/friendships/${friendshipId}/accept`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 404) {
        notification.error("Pedido não encontrado")
        return null
      }

      if (response.status === 401) {
        notification.error("Sessão expirada. Faça login novamente.")
        return null
      }

      if (!response.ok) {
        notification.error("Erro ao aceitar pedido")
        return null
      }

      notification.success("Pedido aceito! Agora vocês são amigos.")
      return await response.json()
      
    } catch (error) {
      notification.error("Erro ao aceitar pedido. Tente novamente.")
      return null
    }
  }

  async declineFriendship(friendshipId: string, customToken?: string): Promise<boolean> {
    try {
      const token = customToken || getAuthToken()
      if (!token) {
        notification.error("Você precisa estar logado para recusar pedidos")
        return false
      }

      if (!friendshipId) {
        notification.error("ID da amizade não fornecido")
        return false
      }

      const response = await fetch(`${API_URL}/api/users/friendships/${friendshipId}/decline`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 404) {
        notification.error("Pedido não encontrado")
        return false
      }

      if (response.status === 401) {
        notification.error("Sessão expirada. Faça login novamente.")
        return false
      }

      if (!response.ok) {
        notification.error("Erro ao recusar pedido")
        return false
      }

      notification.success("Pedido recusado")
      return true
      
    } catch (error) {
      notification.error("Erro ao recusar pedido. Tente novamente.")
      return false
    }
  }

  async removeFriendship(friendshipId: string, customToken?: string): Promise<boolean> {
    try {
      const token = customToken || getAuthToken()
      if (!token) {
        notification.error("Você precisa estar logado para remover amizade")
        return false
      }

      if (!friendshipId) {
        notification.error("ID da amizade não fornecido")
        return false
      }

      const response = await fetch(`${API_URL}/api/users/friendships/${friendshipId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 404) {
        notification.error("Amizade não encontrada")
        return false
      }

      if (response.status === 401) {
        notification.error("Sessão expirada. Faça login novamente.")
        return false
      }

      if (!response.ok) {
        notification.error("Erro ao remover amizade")
        return false
      }

      notification.success("Amizade removida")
      return true
      
    } catch (error) {
      notification.error("Erro ao remover amizade. Tente novamente.")
      return false
    }
  }

  async getPendingFriendships(customToken?: string): Promise<Friendship[]> {
    try {
      const token = customToken || getAuthToken()
      if (!token) {
        notification.error("Você precisa estar logado para ver pedidos")
        return []
      }

      const response = await fetch(`${API_URL}/api/users/friendships/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        notification.error("Sessão expirada. Faça login novamente.")
        return []
      }

      if (!response.ok) {
        notification.error("Erro ao buscar pedidos pendentes")
        return []
      }

      return await response.json()
      
    } catch (error) {
      notification.error("Erro ao carregar pedidos. Tente novamente.")
      return []
    }
  }

  async getFriends(customToken?: string): Promise<FriendsResponse | null> {
    try {
      const token = customToken || getAuthToken()
      if (!token) {
        notification.error("Você precisa estar logado para ver amigos")
        return null
      }

      const response = await fetch(`${API_URL}/api/users/friendships`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        notification.error("Sessão expirada. Faça login novamente.")
        return null
      }

      if (!response.ok) {
        notification.error("Erro ao buscar amigos")
        return null
      }

      return await response.json()
      
    } catch (error) {
      notification.error("Erro ao carregar amigos. Tente novamente.")
      return null
    }
  }

  async getFriendshipStatus(login: string, customToken?: string): Promise<FriendshipStatus | null> {
    try {
      const token = customToken || getAuthToken()
      if (!token) {
        return null
      }

      if (!login) {
        return null
      }

      const response = await fetch(`${API_URL}/api/users/friendships/status/${login}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  async getFriendshipSuggestions(limit: number = 10, customToken?: string): Promise<FriendSuggestion[]> {
    try {
      const token = customToken || getAuthToken()
      if (!token) {
        notification.error("Você precisa estar logado para ver sugestões")
        return []
      }

      const response = await fetch(`${API_URL}/api/users/friendships/suggestions?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        notification.error("Sessão expirada. Faça login novamente.")
        return []
      }

      if (!response.ok) {
        notification.error("Erro ao buscar sugestões")
        return []
      }

      return await response.json()
      
    } catch (error) {
      notification.error("Erro ao carregar sugestões. Tente novamente.")
      return []
    }
  }
}

export const friendshipService = new FriendshipService()