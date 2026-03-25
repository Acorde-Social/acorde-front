"use client"

import { API_URL, getAuthHeaders, handleApiError } from "@/lib/api-config"

export const getFullAudioUrl = (url: string) => {
  if (url.startsWith('http')) return url;

  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

  if (url.startsWith('/uploads/')) {
    return `${baseUrl}${url}`;
  } else if (url.startsWith('uploads/')) {
    return `${baseUrl}/${url}`;
  } else if (url.startsWith('tracks/')) {
    return `${baseUrl}/uploads/${url}`;
  } else {
    return `${baseUrl}/uploads/${url}`;
  }
};

export interface CreateTrackData {
  name: string
  projectId: string
  duration: number
  lyrics?: string
  chords?: string
  credits?: string
  postDescription?: string
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
  async createTrack(data: CreateTrackData, audioFile: File, token: string, overdubFiles?: File[], overdubDurations?: number[]) {
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("projectId", data.projectId)
    formData.append("duration", data.duration.toString())
    formData.append("file", audioFile)

    if (data.lyrics) {
      formData.append("lyrics", data.lyrics)
    }
    if (data.chords) {
      formData.append("chords", data.chords)
    }
    if (data.credits) {
      formData.append("credits", data.credits)
    }
    if (data.postDescription) {
      formData.append("postDescription", data.postDescription)
    }

    if (overdubFiles && overdubFiles.length > 0) {
      for (const f of overdubFiles) {
        formData.append('overdubs', f)
      }
      if (overdubDurations && overdubDurations.length > 0) {
        formData.append('overdubDurations', JSON.stringify(overdubDurations))
      }
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

  async createCollaboration(data: CreateCollaborationData, audioFile: File, token: string) {
    const formData = new FormData()
    formData.append("trackId", data.trackId)
    formData.append("name", data.name)
    if (data.description) {
      formData.append("description", data.description)
    }
    formData.append("duration", data.duration.toString())
    formData.append("file", audioFile)

    const response = await fetch(`${API_URL}/api/collaborations/audio`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    return handleApiError(response)
  },

  async getFeed(token: string, page = 1, limit = 10) {
    const response = await fetch(`${API_URL}/tracks/feed?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },

  async getUserTracks(userId: string, page = 1, limit = 10) {
    const response = await fetch(`${API_URL}/tracks/user/${userId}?page=${page}&limit=${limit}`, {
      method: "GET",
    })

    return handleApiError(response)
  },

  async deleteTrack(id: string, token: string) {
    const response = await fetch(`${API_URL}/tracks/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },

  async correctTrackTiming(options: AudioCorrectionOptions, token: string): Promise<any> {
    const response = await fetch(`${API_URL}/ai-audio/correct-timing`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(options),
    })

    return handleApiError(response)
  },

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

  async getProcessStatus(processId: string, token: string): Promise<any> {
    const response = await fetch(`${API_URL}/ai-audio/process-status/${processId}`, {
      method: "GET",
      headers: getAuthHeaders(token),
    })

    return handleApiError(response)
  },

  async likeTrack(trackId: string, token: string): Promise<any> {
    const response = await fetch(`${API_URL}/tracks/${trackId}/like`, {
      method: "POST",
      headers: getAuthHeaders(token),
    })
    return handleApiError(response)
  },

  async unlikeTrack(trackId: string, token: string): Promise<any> {
    const response = await fetch(`${API_URL}/tracks/${trackId}/like`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    })
    return handleApiError(response)
  },

  async checkIfLiked(trackId: string, token: string): Promise<{liked: boolean}> {
    const response = await fetch(`${API_URL}/tracks/${trackId}/like/check`, {
      method: "GET",
      headers: getAuthHeaders(token),
    })
    return handleApiError(response)
  },

  async getTrackComments(trackId: string, token?: string): Promise<any> {
    const response = await fetch(`${API_URL}/comments/track/${trackId}`, {
      method: "GET",
      headers: getAuthHeaders(token),
    })
    return handleApiError(response)
  },

  async addTrackComment(trackId: string, content: string, token: string): Promise<any> {
    const response = await fetch(`${API_URL}/tracks/${trackId}/comments`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ content }),
    })
    return handleApiError(response)
  },
}

