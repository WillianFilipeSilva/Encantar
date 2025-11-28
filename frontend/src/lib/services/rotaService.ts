import { api } from '../axios'
import { TemplatePDF, ApiResponse, PaginatedResponse } from '../types'
import { generateRotaPDF, PDFData } from '../pdfGenerator'

export const rotaService = {
  /**
   * Busca dados formatados para geração de PDF
   */
  async getPDFData(rotaId: string): Promise<PDFData> {
    const response = await api.get(`/rotas/${rotaId}/pdf-data`)
    return response.data.data
  },

  /**
   * Gera e baixa o PDF da rota no frontend
   * Os atendimentos mantêm a ordem da rota
   */
  async downloadPDF(rotaId: string, templateId: string, filename?: string): Promise<void> {
    // Busca os dados formatados do backend
    const pdfData = await this.getPDFData(rotaId)
    
    // Gera o PDF no frontend
    const finalFilename = filename || `rota-${pdfData.nomeRota.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
    generateRotaPDF(pdfData, finalFilename)
  },

  // Mantém os métodos antigos para retrocompatibilidade (caso o backend seja corrigido)
  async generatePDFBackend(rotaId: string, templateId: string): Promise<Blob> {
    const response = await api.get(`/rotas/${rotaId}/pdf/${templateId}`, {
      responseType: 'blob'
    })
    return response.data
  },

  async previewPDF(rotaId: string, templateId: string): Promise<string> {
    const response = await api.get(`/rotas/${rotaId}/pdf/preview/${templateId}`)
    return response.data
  }
}