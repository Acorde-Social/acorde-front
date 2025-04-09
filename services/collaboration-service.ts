"use client"

import { API_URL, getAuthHeaders, handleApiError } from "@/lib/api-config"
import type { Collaboration } from "./project-service"

export interface CreateCollaborationData {
  projectId: string
}

export const CollaborationService = {
  // Solicitar colaboração em um projeto
  async requestCollaboration(data: CreateCollaborationData, token: string): Promise<Collaboration> {
    const { projectId } = data;
    
    // Usando o novo endpoint específico para projetos
    const response = await fetch(`${API_URL}/collaborations/project/${projectId}`, {
      method: "POST",
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },

  // Aceitar colaboração
  async acceptCollaboration(id: string, token: string): Promise<Collaboration> {
    const response = await fetch(`${API_URL}/collaborations/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status: "ACCEPTED" }),
    })

    return handleApiError(response)
  },

  // Rejeitar colaboração
  async rejectCollaboration(id: string, token: string): Promise<Collaboration> {
    const response = await fetch(`${API_URL}/collaborations/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status: "REJECTED" }),
    })

    return handleApiError(response)
  },
  
  // Marcar colaboração como concluída
  async completeCollaboration(id: string, token: string): Promise<Collaboration> {
    const response = await fetch(`${API_URL}/collaborations/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status: "COMPLETED" }),
    })

    return handleApiError(response)
  },

  // Cancelar/remover solicitação de colaboração
  async cancelCollaboration(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/collaborations/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },
  
  // Obter colaborações de um projeto
  async getProjectCollaborations(projectId: string, token?: string): Promise<Collaboration[]> {
    const response = await fetch(`${API_URL}/collaborations/project/${projectId}`, {
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },
  
  // Obter colaborações do usuário atual
  async getUserCollaborations(token: string): Promise<Collaboration[]> {
    const response = await fetch(`${API_URL}/collaborations/user`, {
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },
  
  // Obter colaborações de áudio do usuário atual (enviadas)
  async getUserAudioCollaborations(token: string): Promise<any[]> {
    const response = await fetch(`${API_URL}/collaborations/audio`, {
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },
  
  // Obter colaborações de áudio recebidas pelo usuário atual
  async getReceivedAudioCollaborations(token: string): Promise<any[]> {
    const response = await fetch(`${API_URL}/collaborations/audio/received`, {
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },
  
  // Obter detalhes de uma colaboração de áudio
  async getAudioCollaboration(id: string, token: string): Promise<any> {
    const response = await fetch(`${API_URL}/collaborations/audio/${id}`, {
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },
  
  // Atualizar status de uma colaboração de áudio (aceitar ou rejeitar)
  async updateAudioCollaborationStatus(id: string, status: string, token: string): Promise<any> {
    const response = await fetch(`${API_URL}/collaborations/audio/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status }),
    })

    return handleApiError(response)
  },
  
  // Remover uma colaboração de áudio
  async removeAudioCollaboration(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/collaborations/audio/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },
}

