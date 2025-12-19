const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
export const API_URL = `${baseUrl}/api`

export const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {}

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return headers
}
export const getJsonAuthHeaders = (token?: string) => {
  const headers = getAuthHeaders(token)
  headers["Content-Type"] = "application/json"
  return headers
}
export const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.message || "Ocorreu um erro na requisição"
    throw new Error(errorMessage)
  }
  return response.json()
}

