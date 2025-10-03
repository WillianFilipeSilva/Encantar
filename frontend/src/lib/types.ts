export interface TemplatePDF {
  id: string
  nome: string
  descricao?: string | null
  conteudo: string
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
}

export interface CreateTemplatePDFDTO {
  nome: string
  descricao?: string
  conteudo: string
}

export interface UpdateTemplatePDFDTO {
  nome?: string
  descricao?: string
  conteudo?: string
  ativo?: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}