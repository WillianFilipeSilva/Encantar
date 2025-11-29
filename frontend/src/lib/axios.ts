import axios from 'axios'

const rawApiBaseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const apiBaseURL = rawApiBaseURL.replace(/\/$/, '')

const buildApiUrl = (path: string) => `${apiBaseURL}${path}`

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: any) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  
  failedQueue = []
}

// Função para limpar estado de autenticação e redirecionar
const handleAuthFailure = () => {
  isRefreshing = false
  failedQueue = []
  
  // Só redireciona se estiver no browser e não já estiver na página de login
  if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
    window.location.href = '/login'
  }
}

export const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Se estiver no servidor (SSR), rejeita imediatamente
    if (typeof window === 'undefined') {
      return Promise.reject(error)
    }

    // Lista de rotas que NÃO devem tentar refresh
    const noRefreshRoutes = ['/auth/login', '/auth/refresh', '/auth/register', '/auth/logout']
    const originalUrl = originalRequest.url || ''
    const normalizedUrl = originalUrl.startsWith('http')
      ? originalUrl.replace(apiBaseURL, '')
      : originalUrl
    const isNoRefreshRoute = noRefreshRoutes.some(route => normalizedUrl.includes(route))

    // Se não for 401 ou for uma rota que não deve fazer refresh, rejeita
    if (error.response?.status !== 401 || isNoRefreshRoute) {
      return Promise.reject(error)
    }

    // Se já tentou retry, não tenta novamente (evita loop infinito)
    if (originalRequest._retry) {
      handleAuthFailure()
      return Promise.reject(error)
    }

    // Se já está refreshing, adiciona à fila
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(() => {
        return api(originalRequest)
      }).catch(err => {
        return Promise.reject(err)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // Usa axios puro para evitar interceptor recursivo
      await axios.post(
        buildApiUrl('/auth/refresh'),
        {},
        { withCredentials: true }
      )

      // Refresh bem-sucedido, processa a fila
      processQueue(null, null)
      isRefreshing = false
      
      // Retenta a requisição original
      return api(originalRequest)
    } catch (refreshError: any) {
      // Refresh falhou
      processQueue(refreshError, null)
      isRefreshing = false
      
      // Se o refresh falhou com 401 ou 429, redireciona para login
      if (refreshError.response?.status === 401 || refreshError.response?.status === 429) {
        handleAuthFailure()
      }
      
      return Promise.reject(refreshError)
    }
  },
)