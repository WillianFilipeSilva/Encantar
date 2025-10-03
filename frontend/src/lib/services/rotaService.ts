import { api } from '../axios'
import { TemplatePDF, ApiResponse, PaginatedResponse } from '../types'

export const rotaService = {
  async generatePDF(rotaId: string, templateId: string): Promise<Blob> {
    const response = await api.get(`/rotas/${rotaId}/pdf/${templateId}`, {
      responseType: 'blob'
    })
    return response.data
  },

  async previewPDF(rotaId: string, templateId: string): Promise<string> {
    const response = await api.get(`/rotas/${rotaId}/pdf/preview/${templateId}`)
    return response.data
  },

  async downloadPDF(rotaId: string, templateId: string, filename?: string): Promise<void> {
    const blob = await this.generatePDF(rotaId, templateId)
    
    // Criar URL temporária
    const url = window.URL.createObjectURL(blob)
    
    // Criar elemento de download
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `rota-${rotaId}.pdf`
    
    // Adicionar ao DOM e clicar
    document.body.appendChild(link)
    link.click()
    
    // Limpar
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}