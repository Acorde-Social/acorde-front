import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Configuração da API
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// Headers padrão para requisições
export const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return headers
}

// Função para lidar com erros da API
export const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.message || "Ocorreu um erro na requisição"
    throw new Error(errorMessage)
  }
  return response.json()
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

