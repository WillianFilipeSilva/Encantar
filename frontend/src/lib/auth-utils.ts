/**
 * Utilitários para gerenciamento de autenticação
 */

export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('@encantar:token')
    localStorage.removeItem('@encantar:refresh-token')
    localStorage.removeItem('@encantar:user')
  }
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp < currentTime
  } catch {
    return true
  }
}

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('@encantar:token')
}

export const getStoredRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('@encantar:refresh-token')
}

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null
  
  try {
    const userData = localStorage.getItem('@encantar:user')
    if (!userData || userData === 'undefined' || userData === 'null') {
      return null
    }
    return JSON.parse(userData)
  } catch {
    return null
  }
}