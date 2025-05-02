"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { API_URL, getAuthHeaders, handleApiError } from "@/lib/api-config"
import { socketService } from "@/services/socket-service"
import { ThemeConfig } from "@/hooks/use-theme-customization"

interface ThemePreferences {
  primaryColor: string
  layout: "default" | "compact" | "spacious"
}

export interface User {
  id: string
  name: string
  email: string
  login: string
  role: "COMPOSER" | "MUSICIAN" | "PRODUCER" | "SONGWRITER" | "VOCALIST" | "BEATMAKER" | "ENGINEER" | "ARRANGER" | "MIXER" | "DJ" | "LISTENER"
  avatarUrl?: string
  coverImageUrl?: string
  bio?: string
  instruments?: string[]
  experience?: string
  emailVerified?: boolean
  themeConfig?: ThemeConfig
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  pendingVerification: boolean
  verificationEmail: string | null
  login: (identifier: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  resendVerification: (email: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
  updateUserTheme: (theme: ThemePreferences) => void
}

interface RegisterData {
  name: string
  login: string
  email: string
  password: string
  role: "COMPOSER" | "MUSICIAN" | "PRODUCER" | "SONGWRITER" | "VOCALIST" | "BEATMAKER" | "ENGINEER" | "ARRANGER" | "MIXER" | "DJ" | "LISTENER"
  experience?: string
  bio?: string
  instruments?: string[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingVerification, setPendingVerification] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null)
  const router = useRouter()

  // Verificar se o usuário está autenticado ao carregar a página
  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      fetchUserProfile(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  // Inicializar WebSocket quando o token mudar
  useEffect(() => {
    if (token) {
      socketService.connect(token)
    } else {
      socketService.disconnect()
    }

    // Cleanup ao desmontar
    return () => {
      socketService.disconnect()
    }
  }, [token])

  // Buscar perfil do usuário com o token
  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: getAuthHeaders(authToken),
      })

      const userData = await handleApiError(response)
      setUser(userData)
      setToken(authToken)
    } catch (err) {
      console.error("Erro ao buscar perfil:", err)
      localStorage.removeItem("token")
    } finally {
      setIsLoading(false)
    }
  }

  // Login
  const login = async (identifier: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ identifier, password }),
      })

      const data = await handleApiError(response)
      const { access_token, user: userData } = data

      localStorage.setItem("token", access_token)
      setToken(access_token)
      setUser(userData)

      // Inicializar WebSocket após login
      socketService.connect(access_token)

      router.push("/")
    } catch (err) {
      // Verificar se o erro é relacionado à verificação de email
      if (err instanceof Error && err.message.includes("verifique seu email")) {
        setPendingVerification(true)
        setVerificationEmail(identifier)
        setError("Por favor, verifique seu email antes de fazer login")
      } else {
        setError(err instanceof Error ? err.message : "Erro ao fazer login")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Registro
  const register = async (userData: RegisterData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData),
      })

      const data = await handleApiError(response)

      // Verificar se o registro retornou uma flag de verificação de email
      if (data && data.requiresEmailVerification) {
        setPendingVerification(true)
        setVerificationEmail(userData.email)
        router.push("/verify-email/pending") // Redirecionar para página informativa
      } else {
        // Se não necessitar verificação (comportamento antigo), fazer login automático
        await login(userData.email, userData.password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registrar")
    } finally {
      setIsLoading(false)
    }
  }

  // Reenviar email de verificação
  const resendVerification = async (email: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email }),
      })

      await handleApiError(response)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao reenviar email de verificação")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout
  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    setToken(null)
    setPendingVerification(false)
    setVerificationEmail(null)

    // Desconectar WebSocket
    socketService.disconnect()

    router.push("/")
  }

  // Limpar erro
  const clearError = () => setError(null)

  const updateUserTheme = (themeConfig: ThemePreferences) => {
    if (user) {
      setUser({ ...user, themeConfig })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        pendingVerification,
        verificationEmail,
        login,
        register,
        resendVerification,
        logout,
        clearError,
        updateUserTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}

