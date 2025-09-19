import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@encantar:token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('@encantar:refresh-token')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await api.post('/auth/refresh', {
          refreshToken,
        })

        const { token } = response.data

        localStorage.setItem('@encantar:token', token)

        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      } catch (_error) {
        localStorage.removeItem('@encantar:token')
        localStorage.removeItem('@encantar:refresh-token')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)