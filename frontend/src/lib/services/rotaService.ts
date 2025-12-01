import { api } from '../axios'
import { TemplatePDF, ApiResponse, PaginatedResponse } from '../types'
import { generatePDF, PDFData } from '../pdfGenerator'

export const rotaService = {
  /**
   * Busca dados da rota formatados para PDF
   */
  async getPDFData(rotaId: string): Promise<PDFData> {
    const response = await api.get(`/rotas/${rotaId}/pdf-data`)
    return response.data.data
  },

  /**
   * Busca template pelo ID
   */
  async getTemplate(templateId: string): Promise<TemplatePDF> {
    const response = await api.get(`/templates/${templateId}`)
    return response.data.data
  },

  /**
   * Gera e baixa o PDF da rota usando o template selecionado
   */
  async downloadPDF(rotaId: string, templateId: string, filename?: string): Promise<void> {
    const [pdfData, template] = await Promise.all([
      this.getPDFData(rotaId),
      this.getTemplate(templateId)
    ])

    const finalFilename = filename || `rota-${pdfData.nomeRota.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`

    await generatePDF(pdfData, template.conteudo, finalFilename)
  },

  /**
   * Retorna URL de preview do PDF
   */
  async previewPDF(rotaId: string, templateId: string): Promise<string> {
    const response = await api.get(`/rotas/${rotaId}/pdf/preview/${templateId}`)
    return response.data
  }
}