import { api } from '../axios'

export interface InviteData {
  email?: string
  telefone?: string
}

export interface ActiveInvite {
  token: string
  expiraEm: string
}

export interface InviteResponse {
  token: string
  expiraEm: string
}

export const inviteService = {
  /**
   * Cria um novo convite (email OU telefone)
   */
  async createInvite(data: InviteData = {}): Promise<InviteResponse> {
    const cleanData: InviteData = {}
    if (data.email?.trim()) cleanData.email = data.email.trim()
    if (data.telefone?.trim()) cleanData.telefone = data.telefone.trim()
    
    const response = await api.post('/invite', cleanData)
    return response.data.data
  },

  /**
   * Busca o convite ativo do usuário
   */
  async getActiveInvite(): Promise<ActiveInvite | null> {
    const response = await api.get('/invite/active')
    return response.data.data
  },

  /**
   * Valida um token de convite
   */
  async validateInvite(token: string): Promise<{
    email?: string
    telefone?: string
    enviadoPor: string
    expiraEm: string
  }> {
    const response = await api.get(`/invite/${token}`)
    return response.data.data
  },

  /**
   * Registra um usuário via convite
   */
  async register(data: {
    nome: string
    login: string
    senha: string
    token: string
    emailValidacao?: string
    telefoneValidacao?: string
  }): Promise<{
    user: {
      id: string
      nome: string
      login: string
    }
  }> {
    const response = await api.post('/auth/register', data)
    return response.data.data
  },

  /**
   * Gera o link completo do convite
   */
  generateInviteLink(token: string): string {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_APP_URL || 'https://encantarback-production.up.railway.app/api'
    
    return `${baseUrl}/register/${token}`
  }
}