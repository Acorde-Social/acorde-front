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

// Função para corrigir URLs de imagens de projetos
export function fixImageUrl(url: string | undefined): string {
  if (!url) return "/placeholder.svg"
  
  // Se já for uma URL relativa ou absoluta que não pertence à nossa API, retorne como está
  if (url.startsWith("/") && !url.startsWith("/uploads/")) return url
  if (url.startsWith("http") && !url.includes(API_URL)) return url
  
  // Se for uma URL da nossa API, verifique se já possui o segmento '/images/'
  if (url.includes("/uploads/") && !url.includes("/uploads/images/")) {
    // Substitui "/uploads/" por "/uploads/images/" para URLs existentes
    const urlParts = url.split("/uploads/")
    return `${urlParts[0]}/uploads/images/${urlParts[1]}`
  }
  
  // Se já tiver o segmento correto, retorne como está
  return url
}

