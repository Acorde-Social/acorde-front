"use client"

import { API_URL, getAuthHeaders, handleApiError } from "@/lib/api-config"

export interface Project {
  id: string
  title: string
  description?: string
  genre: string
  bpm: number
  key: string
  imageUrl?: string
  authorId: string
  author: {
    id: string
    name: string
    avatarUrl?: string
  }
  neededInstruments: string[]
  createdAt: string
  updatedAt: string
  _count?: {
    collaborations: number
    tracks: number
  }
}

export interface ProjectDetail extends Project {
  tracks: Track[]
  collaborations: Collaboration[]
  comments: Comment[]
}

export interface Track {
  id: string
  name: string
  audioUrl: string
  duration: number
  projectId: string
  authorId: string
  author: {
    id: string
    name: string
    avatarUrl?: string
  }
  createdAt: string
}

export interface Collaboration {
  id: string
  projectId: string
  userId: string
  user: {
    id: string
    name: string
    avatarUrl?: string
    instruments?: string[]
    experience?: string
  }
  role: "COMPOSER" | "MUSICIAN"
  instrument?: string
  status: "PENDING" | "ACCEPTED" | "REJECTED"
  createdAt: string
}

export interface Comment {
  id: string
  text: string
  projectId: string
  authorId: string
  author: {
    id: string
    name: string
    avatarUrl?: string
  }
  likes: number
  createdAt: string
}

export interface CreateProjectData {
  title: string
  description?: string
  genre: string
  bpm: number
  key: string
  neededInstruments: string[]
}

export interface ProjectFilter {
  genre?: string
  instrument?: string
  minBpm?: number
  maxBpm?: number
  key?: string
}

export const ProjectService = {
  // Buscar todos os projetos com filtros opcionais
  async getProjects(filters?: ProjectFilter, token?: string): Promise<Project[]> {
    let url = `${API_URL}/projects`

    if (filters) {
      const params = new URLSearchParams()
      if (filters.genre) params.append("genre", filters.genre)
      if (filters.instrument) params.append("instrument", filters.instrument)
      if (filters.minBpm) params.append("minBpm", filters.minBpm.toString())
      if (filters.maxBpm) params.append("maxBpm", filters.maxBpm.toString())
      if (filters.key) params.append("key", filters.key)

      if (params.toString()) {
        url += `?${params.toString()}`
      }
    }

    try {
      const response = await fetch(url, {
        headers: getAuthHeaders(token),
      })

      const data = await handleApiError(response)
      // Garantindo que sempre retornamos um array, mesmo se a API retornar null ou undefined
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error("Erro ao buscar projetos:", error)
      // Para evitar loops infinitos em caso de erro, retornamos um array vazio
      // em vez de propagar a exceção
      return []
    }
  },

  // Buscar projeto por ID
  async getProjectById(id: string, token?: string): Promise<ProjectDetail> {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },

  // Criar novo projeto
  async createProject(data: CreateProjectData, token: string): Promise<Project> {
    const response = await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    })

    return handleApiError(response)
  },

  // Atualizar projeto
  async updateProject(id: string, data: Partial<CreateProjectData>, token: string): Promise<Project> {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    })

    return handleApiError(response)
  },

  // Excluir projeto
  async deleteProject(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },

  // Upload de imagem do projeto
  async uploadProjectImage(id: string, file: File, token: string): Promise<{ id: string; imageUrl: string }> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${API_URL}/projects/${id}/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    return handleApiError(response)
  },
}

