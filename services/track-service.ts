"use client"

import { API_URL, getAuthHeaders, handleApiError } from "@/lib/api-config"

// Função utilitária para construir URLs completas
export const getFullAudioUrl = (url: string) => {
  // Se já for uma URL completa, retorna como está
  if (url.startsWith('http')) return url;
  
  // Garante que tenhamos a base URL
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  
  // Trata diferentes formatos de caminhos
  if (url.startsWith('/uploads/')) {
    // Caminho começa com /uploads/
    return `${baseUrl}${url}`;
  } else if (url.startsWith('uploads/')) {
    // Caminho começa sem barra
    return `${baseUrl}/${url}`;
  } else if (url.startsWith('tracks/')) {
    // Caminho começa com tracks/ (caso comum do erro)
    return `${baseUrl}/uploads/${url}`;
  } else {
    // Outros casos, adiciona /uploads/ se necessário
    return `${baseUrl}/uploads/${url}`;
  }
};

export interface CreateTrackData {
  name: string
  projectId: string
  duration: number
  lyrics?: string
  chords?: string
  credits?: string // JSON string
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

export interface AudioCorrectionOptions {
  trackId?: string;
  audioUrl?: string;
  targetBpm?: number;
  quantizeStrength?: number;
  preserveExpression?: boolean;
}

export const TrackService = {
  // Criar nova faixa
  async createTrack(data: CreateTrackData, audioFile: File, token: string) {
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("projectId", data.projectId)
    formData.append("duration", data.duration.toString())
    formData.append("file", audioFile)
    
    // Adicionar campos opcionais
    if (data.lyrics) {
      formData.append("lyrics", data.lyrics)
    }
    if (data.chords) {
      formData.append("chords", data.chords)
    }
    if (data.credits) {
      formData.append("credits", data.credits)
    }

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

  // Correção de tempo avançada para faixas existentes
  async correctTrackTiming(options: AudioCorrectionOptions, token: string): Promise<any> {
    const response = await fetch(`${API_URL}/ai-audio/correct-timing`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(options),
    })

    return handleApiError(response)
  },

  // Enviar arquivo para correção de tempo avançada
  async uploadForTimingCorrection(
    file: File,
    options: {
      targetBpm?: number;
      quantizeStrength?: number;
      preserveExpression?: boolean;
    },
    token: string
  ): Promise<any> {
    const formData = new FormData()
    formData.append("audioFile", file)
    
    if (options.targetBpm) {
      formData.append("targetBpm", options.targetBpm.toString())
    }
    
    if (options.quantizeStrength) {
      formData.append("quantizeStrength", options.quantizeStrength.toString())
    }
    
    if (options.preserveExpression !== undefined) {
      formData.append("preserveExpression", options.preserveExpression.toString())
    }

    const response = await fetch(`${API_URL}/ai-audio/correct-timing-upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    return handleApiError(response)
  },

  // Obter status do processamento
  async getProcessStatus(processId: string, token: string): Promise<any> {
    const response = await fetch(`${API_URL}/ai-audio/process-status/${processId}`, {
      method: "GET",
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },

  // Curtir uma faixa
  async likeTrack(trackId: string, token: string): Promise<any> {
    const response = await fetch(`${API_URL}/tracks/${trackId}/like`, {
      method: "POST",
      headers: getAuthHeaders(token),
    })
    return handleApiError(response)
  },

  // Descurtir uma faixa
  async unlikeTrack(trackId: string, token: string): Promise<any> {
    const response = await fetch(`${API_URL}/tracks/${trackId}/like`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    })
    return handleApiError(response)
  },

  // Verificar se o usuário curtiu uma faixa
  async checkIfLiked(trackId: string, token: string): Promise<{liked: boolean}> {
    const response = await fetch(`${API_URL}/tracks/${trackId}/like/check`, {
      method: "GET",
      headers: getAuthHeaders(token),
    })
    return handleApiError(response)
  },

  // Buscar comentários de uma faixa
  async getTrackComments(trackId: string, token?: string): Promise<any> { // Assuming comments might be public
    const response = await fetch(`${API_URL}/comments/track/${trackId}`, {
      method: "GET",
      headers: getAuthHeaders(token), // Token might be needed depending on API
    })
    return handleApiError(response)
  },

  // Adicionar comentário a uma faixa
  async addTrackComment(trackId: string, content: string, token: string): Promise<any> {
    const response = await fetch(`${API_URL}/tracks/${trackId}/comments`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ content }),
    })
    return handleApiError(response)
  },
}

