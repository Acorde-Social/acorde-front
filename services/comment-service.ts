"use client"

import { API_URL, getAuthHeaders, handleApiError } from "@/lib/api-config"
import type { Comment } from "./project-service"

export interface CreateCommentData {
  text: string
  projectId: string
}

export const CommentService = {
  // Criar novo comentário
  async createComment(data: CreateCommentData, token: string): Promise<Comment> {
    const { projectId, text } = data;
    const response = await fetch(`${API_URL}/comments/project/${projectId}`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ text }),
    })

    return handleApiError(response)
  },

  // Excluir comentário
  async deleteComment(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/comments/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },
}

