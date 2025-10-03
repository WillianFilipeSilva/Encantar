import { api } from '../axios'
import { TemplatePDF, CreateTemplatePDFDTO, UpdateTemplatePDFDTO, ApiResponse, PaginatedResponse } from '../types'

export const templateService = {
  async findAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<TemplatePDF>> {
    const response = await api.get(`/templates?page=${page}&limit=${limit}`)
    return response.data
  },

  async findById(id: string): Promise<ApiResponse<TemplatePDF>> {
    const response = await api.get(`/templates/${id}`)
    return response.data
  },

  async create(data: CreateTemplatePDFDTO): Promise<ApiResponse<TemplatePDF>> {
    const response = await api.post('/templates', data)
    return response.data
  },

  async update(id: string, data: UpdateTemplatePDFDTO): Promise<ApiResponse<TemplatePDF>> {
    const response = await api.put(`/templates/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/templates/${id}`)
    return response.data
  },

  async search(query: string, limit: number = 10): Promise<ApiResponse<TemplatePDF[]>> {
    const response = await api.get(`/templates/search?q=${encodeURIComponent(query)}&limit=${limit}`)
    return response.data
  },

  async findActive(): Promise<ApiResponse<TemplatePDF[]>> {
    const response = await api.get('/templates/active')
    return response.data
  },

  async toggleAtivo(id: string): Promise<ApiResponse<TemplatePDF>> {
    const response = await api.patch(`/templates/${id}/toggle`)
    return response.data
  }
}