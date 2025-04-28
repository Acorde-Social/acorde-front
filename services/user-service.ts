import { API_URL, getAuthHeaders, handleApiError } from "@/lib/api-config"
import type { User } from "@/types" // Assuming User type is defined in types/index.ts

export const UserService = {
  /**
   * Busca os dados públicos de um usuário pelo ID.
   * @param userId - O ID do usuário a ser buscado.
   * @param token - O token de autenticação (opcional, pode ser necessário se a API exigir).
   * @returns Os dados do usuário.
   */
  async getUserById(userId: string, token?: string): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        headers: getAuthHeaders(token), // Inclui o token se fornecido
      })

      if (!response.ok) {
        await handleApiError(response)
      }

      return await response.json()
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error)
      throw error // Re-throw para ser tratado pelo chamador
    }
  },
}
