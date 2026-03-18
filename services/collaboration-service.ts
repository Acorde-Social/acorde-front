"use client"

import { API_URL, getAuthHeaders, handleApiError } from "@/lib/api-config"
import type { Collaboration } from "./project-service"

export interface CreateCollaborationData {
  projectId: string
}

export const CollaborationService = {
  async requestCollaboration(data: CreateCollaborationData, token: string): Promise<Collaboration> {
    const { projectId } = data;

    const response = await fetch(`${API_URL}/api/collaborations/project/${projectId}`, {
      method: "POST",
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },

  async acceptCollaboration(id: string, token: string): Promise<Collaboration> {
    const response = await fetch(`${API_URL}/api/collaborations/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status: "ACCEPTED" }),
    })

    return handleApiError(response)
  },

  async rejectCollaboration(id: string, token: string): Promise<Collaboration> {
    const response = await fetch(`${API_URL}/api/collaborations/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status: "REJECTED" }),
    })

    return handleApiError(response)
  },

  async completeCollaboration(id: string, token: string): Promise<Collaboration> {
    const response = await fetch(`${API_URL}/api/collaborations/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status: "COMPLETED" }),
    })

    return handleApiError(response)
  },

  async cancelCollaboration(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/collaborations/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },

  async getProjectCollaborations(projectId: string, token?: string): Promise<Collaboration[]> {
    const response = await fetch(`${API_URL}/api/collaborations/project/${projectId}`, {
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },

  async getUserCollaborations(token: string): Promise<Collaboration[]> {
    const response = await fetch(`${API_URL}/api/collaborations/user`, {
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },

  async getUserAudioCollaborations(token: string): Promise<any[]> {
    const response = await fetch(`${API_URL}/api/collaborations/audio`, {
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },

  async getReceivedAudioCollaborations(token: string): Promise<any[]> {
    const response = await fetch(`${API_URL}/api/collaborations/audio/received`, {
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },

  async getAudioCollaboration(id: string, token: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/collaborations/audio/${id}`, {
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },

  async updateAudioCollaborationStatus(id: string, status: string, token: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/collaborations/audio/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status }),
    })

    return handleApiError(response)
  },

  async removeAudioCollaboration(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/collaborations/audio/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },
}

