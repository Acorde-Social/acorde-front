"use client"

import { API_URL, getAuthHeaders, handleApiError } from "@/lib/api-config"

export interface CreateTrackData {
  name: string
  projectId: string
  duration: number
}

export interface CreateCollaborationData {
  trackId: string
  name: string
  description?: string
  duration: number
}

export interface TrackMetadata {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: TrackMetadata
}

export const TrackService = {
  // Criar nova faixa
  async createTrack(data: CreateTrackData, audioFile: File, token: string) {
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("projectId", data.projectId)
    formData.append("duration", data.duration.toString())
    formData.append("file", audioFile)

    const response = await fetch(`${API_URL}/tracks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    return handleApiError(response)
  },

  // Criar colaboração para uma faixa existente
  async createCollaboration(data: CreateCollaborationData, audioFile: File, token: string) {
    const formData = new FormData()
    formData.append("trackId", data.trackId)
    formData.append("name", data.name)
    if (data.description) {
      formData.append("description", data.description)
    }
    formData.append("duration", data.duration.toString())
    formData.append("file", audioFile)

    const response = await fetch(`${API_URL}/collaborations/audio`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    return handleApiError(response)
  },

  // Buscar feed de áudios (áudios independentes de todos os usuários)
  async getFeed(token: string, page = 1, limit = 10) {
    const response = await fetch(`${API_URL}/tracks/feed?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },

  // Buscar áudios de um usuário específico
  async getUserTracks(userId: string, page = 1, limit = 10) {
    const response = await fetch(`${API_URL}/tracks/user/${userId}?page=${page}&limit=${limit}`, {
      method: "GET",
    })

    return handleApiError(response)
  },

  // Excluir faixa
  async deleteTrack(id: string, token: string) {
    const response = await fetch(`${API_URL}/tracks/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },
}

