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
  text?: string
  mediaType?: 'image' | 'gif'
  mediaUrl?: string
  emotions?: string
  projectId?: string
  trackId?: string
  authorId: string
  author: {
    id: string
    name: string
    avatarUrl?: string
  }
  likes: number
  createdAt: string
  updatedAt: string
  isLiked?: boolean
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

interface GetProjectsFilters {
  genre?: string
  instrument?: string
  minBpm?: number
  maxBpm?: number
  key?: string
}

export class ProjectService {
  private static getFormDataAuthHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`
    }
  }

  static async getProjects(filters: GetProjectsFilters = {}, token: string): Promise<Project[]> {
    const queryParams = new URLSearchParams()

    if (filters.genre) queryParams.append("genre", filters.genre)
    if (filters.instrument) queryParams.append("instrument", filters.instrument)
    if (filters.minBpm) queryParams.append("minBpm", filters.minBpm.toString())
    if (filters.maxBpm) queryParams.append("maxBpm", filters.maxBpm.toString())
    if (filters.key) queryParams.append("key", filters.key)

    const response = await fetch(`${API_URL}/api/projects?${queryParams}`, {
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  }

  static async getProject(id: string, token: string): Promise<ProjectDetail> {
    const response = await fetch(`${API_URL}/api/projects/${id}`, {
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  }

  static async getProjectById(id: string, token?: string): Promise<ProjectDetail> {
    return this.getProject(id, token || '');
  }

  static async createProject(projectData: FormData, token: string): Promise<Project> {
    const response = await fetch(`${API_URL}/api/projects`, {
      method: "POST",
      headers: this.getFormDataAuthHeaders(token),
      body: projectData,
    })

    return handleApiError(response)
  }

  static async updateProject(id: string, projectData: FormData, token: string): Promise<Project> {
    const response = await fetch(`${API_URL}/api/projects/${id}`, {
      method: "PATCH",
      headers: this.getFormDataAuthHeaders(token),
      body: projectData,
    })

    return handleApiError(response)
  }

  static async deleteProject(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/projects/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  }

  static async getUserProjects(token: string): Promise<Project[]> {
    const response = await fetch(`${API_URL}/api/projects/user`, {
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  }

  static async getUserCollaborations(token: string): Promise<Project[]> {
    const response = await fetch(`${API_URL}/api/projects/collaborations`, {
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  }
}

