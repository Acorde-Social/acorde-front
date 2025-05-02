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
  
  // Se já for uma URL completa (http), retorna como está
  if (url.startsWith("http")) return url
  
  let finalUrl = '';
  
  // Se for upload estático, prefixa com API_URL
  if (url.startsWith("/uploads/")) {
    finalUrl = `${API_URL}${url}`
  }
  // Para uploads de chat que não começam com '/'
  else if (url.includes("uploads/chat/")) {
    finalUrl = `${API_URL}/uploads/chat/${url.split("uploads/chat/")[1]}`
  }
  // Se já for uma URL relativa que não pertence à nossa API, retorne como está
  else if (url.startsWith("/") && !url.startsWith("/uploads/")) {
    return url
  }
  // Para outros casos, limpe qualquer 'undefined' do caminho
  else {
    finalUrl = `${API_URL}/${url.replace(/undefined\//, '')}`
  }
  
  // Adicionar timestamp para arquivos de áudio para evitar problemas de CORS e cache
  if (finalUrl.match(/\.(mp3|wav|ogg|webm)$/i)) {
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl += `${separator}t=${Date.now()}`;
  }
  
  return finalUrl;
}

