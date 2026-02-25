import axios from 'axios';
import { API_URL, getAuthHeaders, handleApiError } from '@/lib/api-config';
import { getAuthToken } from '@/utils/auth';
import type { User } from '@/types';

// Interface para resultado da busca de usuários
export interface SearchUsersResult {
  users: User[];
  total: number;
}

// Classe do serviço de usuário
class UserServiceClass {
  // Busca usuário pelo ID
  async getUserById(userId: string, token?: string): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        headers: getAuthHeaders(token), // Inclui o token se fornecido
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      throw error; // Re-throw para ser tratado pelo chamador
    }
  }

  // Busca usuários pelo nome/termo de busca
  async searchUsers(searchTerm: string, limit = 10): Promise<SearchUsersResult> {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/users/search`, {
        params: { q: searchTerm, limit },
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return { users: [], total: 0 };
    }
  }

  // Atualiza perfil do usuário
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const token = getAuthToken();
      const response = await axios.patch(`${API_URL}/users/profile`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  // Busca perfil do usuário logado
  async getCurrentUserProfile(): Promise<User | null> {
    try {
      const token = getAuthToken();
      if (!token) return null;

      const response = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário atual:', error);
      return null;
    }
  }

  // Atualiza avatar do usuário
  async updateAvatar(file: File): Promise<string> {
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.patch(`${API_URL}/api/users/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.avatarUrl;
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
      throw error;
    }
  }
}

// Exportar uma instância da classe (iniciando com minúscula)
export const userService = new UserServiceClass();

// Exportar a classe para manter compatibilidade com código existente
export const UserService = userService;
