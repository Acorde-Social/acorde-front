import axios from 'axios';
import { API_URL, getAuthHeaders, handleApiError } from '@/lib/api-config';
import { getAuthToken } from '@/utils/auth';
import type { User } from '@/types';
import { notification } from '@/lib/notification';

export interface SearchUsersResult {
  users: User[];
  total: number;
}

class UserServiceClass {

  async getUserById(userId: string, token: string): Promise<User | null> {
    try {
      if (!token) {
        notification.error('Você precisa estar logado para buscar usuários');
        return null;
      }

      if (!userId) {
        notification.error('ID do usuário não fornecido');
        return null;
      }

      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        headers: getAuthHeaders(token),
      });

      if (response.status === 404) {
        notification.error('Usuário não encontrado');
        return null;
      }

      if (response.status === 401) {
        notification.error('Sessão expirada. Faça login novamente.');
        return null;
      }

      if (!response.ok) {
        await handleApiError(response);
        return null;
      }

      const user = await response.json();
      
      if (!user || !user.id) {
        notification.error('Resposta inválida do servidor');
        return null;
      }

      return user;
      
    } catch (error) {
      notification.error('Erro ao buscar usuário', error);
      return null;
    }
  }

  async searchUsers(searchTerm: string, limit = 10): Promise<SearchUsersResult> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        notification.error('Você precisa estar logado para buscar usuários');
        return { users: [], total: 0 };
      }

      if (!searchTerm || searchTerm.length < 2) {
        return { users: [], total: 0 };
      }

      const response = await axios.get(`${API_URL}/api/users/search`, {
        params: { q: searchTerm, limit },
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        notification.error('Sessão expirada. Faça login novamente.');
      } else if (error.response?.status === 400) {
        notification.error('Termo de busca inválido');
      } else {
        notification.error('Erro ao buscar usuários. Tente novamente.');
      }
      return { users: [], total: 0 };
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User | null> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        notification.error('Você precisa estar logado para atualizar o perfil');
        return null;
      }

      const response = await axios.patch(`${API_URL}/api/users/profile`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      notification.success('Perfil atualizado com sucesso!');
      return response.data;
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        notification.error('Sessão expirada. Faça login novamente.');
      } else if (error.response?.status === 400) {
        notification.error('Dados inválidos. Verifique as informações.');
      } else {
        notification.error('Erro ao atualizar perfil. Tente novamente.');
      }
      return null;
    }
  }

  async getCurrentUserProfile(): Promise<User | null> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        return null; 
      }

      const response = await axios.get(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        notification.error('Sessão expirada. Faça login novamente.');
      } else {
        notification.error('Erro ao buscar perfil. Tente novamente.');
      }
      return null;
    }
  }

  async updateAvatar(file: File): Promise<string | null> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        notification.error('Você precisa estar logado para atualizar o avatar');
        return null;
      }

      if (!file) {
        notification.error('Nenhum arquivo selecionado');
        return null;
      }

      if (!file.type.startsWith('image/')) {
        notification.error('O arquivo deve ser uma imagem');
        return null;
      }

      if (file.size > 5 * 1024 * 1024) {
        notification.error('A imagem deve ter no máximo 5MB');
        return null;
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.patch(`${API_URL}/api/users/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      notification.success('Avatar atualizado com sucesso!');
      return response.data.avatarUrl;
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        notification.error('Sessão expirada. Faça login novamente.');
      } else if (error.response?.status === 413) {
        notification.error('Arquivo muito grande. Máximo 5MB.');
      } else {
        notification.error('Erro ao atualizar avatar. Tente novamente.');
      }
      return null;
    }
  }
}

export const userService = new UserServiceClass();
export const UserService = userService;