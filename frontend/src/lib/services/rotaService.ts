import { api } from '../axios'
import { TemplatePDF, ApiResponse, PaginatedResponse } from '../types'

export const rotaService = {
  /**
   * Gera e baixa o PDF da rota usando o template selecionado (via backend)
   */
  async downloadPDF(rotaId: string, templateId: string, filename?: string): Promise<void> {
    const response = await api.get(`/rotas/${rotaId}/pdf/${templateId}`, {
      responseType: 'blob'
    })
    
    // Cria URL e baixa o arquivo
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `rota-${new Date().toISOString().split('T')[0]}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },

  async previewPDF(rotaId: string, templateId: string): Promise<string> {
    const response = await api.get(`/rotas/${rotaId}/pdf/preview/${templateId}`)
    return response.data
  }
}