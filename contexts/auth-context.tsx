'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL, getAuthHeaders, handleApiError } from '@/lib/api-config';
import { socketService } from '@/services/socket-service';
import { ThemeConfig } from '@/hooks/use-theme-customization';

interface ThemePreferences {
  primaryColor: string;
  layout: 'default' | 'compact' | 'spacious';
}

export interface User {
  id: string;
  name: string;
  email: string;
  login: string;
  role:
    | 'COMPOSER'
    | 'MUSICIAN'
    | 'PRODUCER'
    | 'SONGWRITER'
    | 'VOCALIST'
    | 'BEATMAKER'
    | 'ENGINEER'
    | 'ARRANGER'
    | 'MIXER'
    | 'DJ'
    | 'LISTENER';
  avatarUrl?: string;
  coverImageUrl?: string;
  bio?: string;
  instruments?: string[];
  experience?: string;
  emailVerified?: boolean;
  themeConfig?: ThemeConfig;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  pendingVerification: boolean;
  verificationEmail: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  resendVerification: (email: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  updateUserTheme: (theme: ThemePreferences) => void;
  updateUser: (userData: User) => void;
}

interface RegisterData {
  name: string;
  login: string;
  email: string;
  password: string;
  role:
    | 'COMPOSER'
    | 'MUSICIAN'
    | 'PRODUCER'
    | 'SONGWRITER'
    | 'VOCALIST'
    | 'BEATMAKER'
    | 'ENGINEER'
    | 'ARRANGER'
    | 'MIXER'
    | 'DJ'
    | 'LISTENER';
  experience?: string;
  bio?: string;
  instruments?: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const router = useRouter();
  const updateUser = (userData: User) => {
    setUser(userData);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      fetchUserProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      socketService.connect(token);
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [token]);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: getAuthHeaders(authToken),
      });

      const userData = await handleApiError(response);
      setUser(userData);
      setToken(authToken);
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await handleApiError(response);
      const { access_token, user: userData } = data;

      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);

      // Salvar cookie para o middleware
      document.cookie = `auth_token=${access_token}; path=/; max-age=86400; SameSite=Lax`;

      socketService.connect(access_token);

      // Redirecionar para /home em vez de /
      router.push('/home');
    } catch (err) {
      if (err instanceof Error && err.message.includes('verifique seu email')) {
        setPendingVerification(true);
        setVerificationEmail(identifier);
        setError('Por favor, verifique seu email antes de fazer login');
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao fazer login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithToken = async (authToken: string) => {
    setIsLoading(true);
    setError(null);

    try {
      localStorage.setItem('token', authToken);
      setToken(authToken);

      await fetchUserProfile(authToken);

      socketService.connect(authToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao autenticar');
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await handleApiError(response);

      if (data && data.requiresEmailVerification) {
        setPendingVerification(true);
        setVerificationEmail(userData.email);
        router.push('/verify-email/pending');
      } else {
        await login(userData.email, userData.password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar');
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      await handleApiError(response);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reenviar email de verificação');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    // Limpar cookie também
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setUser(null);
    setToken(null);
    setPendingVerification(false);
    setVerificationEmail(null);

    socketService.disconnect();

    router.push('/landing');
  };

  const clearError = () => setError(null);

  const updateUserTheme = (themeConfig: ThemePreferences) => {
    if (user) {
      setUser({ ...user, themeConfig });
    }
  };

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
        loginWithToken,
        register,
        resendVerification,
        logout,
        clearError,
        updateUserTheme,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
