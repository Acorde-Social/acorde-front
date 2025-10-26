"use client"

import { API_URL, getJsonAuthHeaders, handleApiError } from "@/lib/api-config"
import type { Comment } from "@/types"

export interface CreateCommentData {
  text?: string
  mediaType?: 'image' | 'gif'
  mediaUrl?: string
  emotions?: string
  projectId?: string
  trackId?: string
}

export interface UpdateCommentData {
  text?: string
  emotions?: string
}

export const CommentService = {
  // Criar novo comentário em projeto
  async createComment(data: CreateCommentData, token: string): Promise<Comment> {
    const { projectId, trackId, ...commentData } = data;
    
    if (projectId) {
      const response = await fetch(`${API_URL}/comments/project/${projectId}`, {
        method: "POST",
        headers: getJsonAuthHeaders(token),
        body: JSON.stringify(commentData),
      })
      return handleApiError(response)
    } else if (trackId) {
      const response = await fetch(`${API_URL}/comments/track/${trackId}`, {
        method: "POST",
        headers: getJsonAuthHeaders(token),
        body: JSON.stringify(commentData),
      })
      return handleApiError(response)
    } else {
      throw new Error("Você deve fornecer um projectId ou trackId")
    }
  },

  // Buscar comentários de um projeto
  async getProjectComments(projectId: string, token?: string): Promise<Comment[]> {
    const response = await fetch(`${API_URL}/comments/project/${projectId}`, {
      method: "GET",
      headers: token ? getJsonAuthHeaders(token) : { "Content-Type": "application/json" },
    })

    return handleApiError(response)
  },

  // Buscar comentários de uma faixa
  async getTrackComments(trackId: string, token?: string): Promise<Comment[]> {
    const response = await fetch(`${API_URL}/comments/track/${trackId}`, {
      method: "GET",
      headers: token ? getJsonAuthHeaders(token) : { "Content-Type": "application/json" },
    })

    return handleApiError(response)
  },

  // Curtir um comentário
  async likeComment(commentId: string, token: string): Promise<{ success: boolean, message: string }> {
    const response = await fetch(`${API_URL}/comments/${commentId}/like`, {
      method: "POST",
      headers: getJsonAuthHeaders(token),
    })

    return handleApiError(response)
  },

  // Descurtir um comentário
  async unlikeComment(commentId: string, token: string): Promise<{ success: boolean, message: string }> {
    const response = await fetch(`${API_URL}/comments/${commentId}/unlike`, {
      method: "POST",
      headers: getJsonAuthHeaders(token),
    })

    return handleApiError(response)
  },

  // Verificar se um usuário curtiu um comentário
  async checkUserLiked(commentId: string, userId: string): Promise<boolean> {
    const response = await fetch(`${API_URL}/comments/${commentId}/user-liked/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    return handleApiError(response)
  },

  // Excluir comentário
  async deleteComment(id: string, token: string): Promise<{ success: boolean; message: string; totalComments: number }> {
    const response = await fetch(`${API_URL}/comments/${id}`, {
      method: "DELETE",
      headers: getJsonAuthHeaders(token),
    })

    return handleApiError(response)
  },

  // Atualizar comentário
  async updateComment(id: string, data: UpdateCommentData, token: string): Promise<Comment> {
    const response = await fetch(`${API_URL}/comments/${id}`, {
      method: "PATCH",
      headers: getJsonAuthHeaders(token),
      body: JSON.stringify(data),
    })

    return handleApiError(response)
  },
}

