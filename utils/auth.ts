/**
 * Obtém o token de autenticação armazenado no localStorage
 * @returns Token JWT como string ou null se não estiver autenticado
 */
export function getAuthToken(): string | null {
  // Verificar se estamos no ambiente do browser (e não durante SSR)
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

/**
 * Salva o token de autenticação no localStorage
 * @param token Token JWT a ser armazenado
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

/**
 * Remove o token de autenticação do localStorage
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

/**
 * Verifica se o usuário está autenticado (possui um token)
 * @returns true se houver um token armazenado, false caso contrário
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}