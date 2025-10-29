/**
 * DTOs (Data Transfer Objects) para todas as entidades do sistema
 * Garantem validação e tipagem forte nas APIs
 */

export interface BaseResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateBeneficiarioDTO {
  nome: string;
  endereco: string;
  telefone?: string;
  email?: string;
  dataNascimento?: string;
  observacoes?: string;
}

export interface UpdateBeneficiarioDTO {
  nome?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  dataNascimento?: string;
  observacoes?: string;
  ativo?: boolean;
}

export interface BeneficiarioResponseDTO {
  id: string;
  nome: string;
  endereco: string;
  telefone?: string | null;
  email?: string | null;
  observacoes?: string | null;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
  criadoPor: {
    id: string;
    nome: string;
  };
  modificadoPor?: {
    id: string;
    nome: string;
  };
}

export interface CreateItemDTO {
  nome: string;
  descricao?: string;
  unidade: 'KG' | 'G' | 'L' | 'ML' | 'UN' | 'CX' | 'PCT' | 'LATA';
}

export interface UpdateItemDTO {
  nome?: string;
  descricao?: string;
  unidade?: 'KG' | 'G' | 'L' | 'ML' | 'UN' | 'CX' | 'PCT' | 'LATA';
  ativo?: boolean;
}

export interface ItemResponseDTO {
  id: string;
  nome: string;
  descricao?: string | null;
  unidade: 'KG' | 'G' | 'L' | 'ML' | 'UN' | 'CX' | 'PCT' | 'LATA';
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
  criadoPor: {
    id: string;
    nome: string;
  };
  modificadoPor?: {
    id: string;
    nome: string;
  };
}

export interface CreateAtendimentoItemDTO {
  itemId: string;
  quantidade: number;
}

export interface CreateAtendimentoDTO {
  beneficiarioId: string;
  rotaId: string;
  observacoes?: string;
  items: CreateAtendimentoItemDTO[];
}

export interface UpdateAtendimentoItemDTO {
  itemId: string;
  quantidade: number;
}

export interface UpdateAtendimentoDTO {
  beneficiarioId?: string;
  rotaId?: string;
  observacoes?: string;
  status?: string;
  items?: UpdateAtendimentoItemDTO[];
}

export interface AtendimentoItemResponseDTO {
  id: string;
  quantidade: number;
  item: ItemResponseDTO;
}

export interface AtendimentoResponseDTO {
  id: string;
  observacoes?: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
  beneficiario: BeneficiarioResponseDTO;
  rota?: {
    id: string;
    nome: string;
  };
  atendimentoItems: AtendimentoItemResponseDTO[];
  criadoPor: {
    id: string;
    nome: string;
  };
  modificadoPor?: {
    id: string;
    nome: string;
  };
}

export interface CreateRotaDTO {
  nome: string;
  descricao?: string;
  dataAtendimento?: Date;
  observacoes?: string;
  atendimentoIds?: string[];
}

export interface UpdateRotaDTO {
  nome?: string;
  descricao?: string;
  dataAtendimento?: Date;
  observacoes?: string;
  atendimentoIds?: string[];
}

export interface RotaResponseDTO {
  id: string;
  nome: string;
  descricao?: string | null;
  dataAtendimento?: Date | null;
  observacoes?: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
  atendimentos: AtendimentoResponseDTO[];
  criadoPor: {
    id: string;
    nome: string;
  };
  modificadoPor?: {
    id: string;
    nome: string;
  };
}

export interface CreateModeloAtendimentoDTO {
  nome: string;
  descricao?: string;
  modeloItems: Array<{
    itemId: string;
    quantidade: number;
  }>;
}

export interface UpdateModeloAtendimentoDTO {
  nome?: string;
  descricao?: string;
  ativo?: boolean;
  modeloItems?: Array<{
    itemId: string;
    quantidade: number;
  }>;
}

export interface CreateTemplatePDFDTO {
  nome: string;
  descricao?: string;
  conteudo: string;
}

export interface UpdateTemplatePDFDTO {
  nome?: string;
  descricao?: string;
  conteudo?: string;
  ativo?: boolean;
}

export interface TemplatePDFResponseDTO {
  id: string;
  nome: string;
  descricao?: string | null;
  conteudo: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface BeneficiarioFiltersDTO {
  search?: string;
  ativo?: boolean;
  dataInicio?: string;
  dataFim?: string;
}

export interface ItemFiltersDTO {
  search?: string;
  ativo?: boolean;
  unidade?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface AtendimentoFiltersDTO {
  search?: string;
  beneficiarioId?: string;
  rotaId?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface RotaFiltersDTO {
  search?: string;
  dataInicio?: string;
  dataFim?: string;
  dataAtendimentoInicio?: string;
  dataAtendimentoFim?: string;
}

export interface DashboardStatsDTO {
  totalAtendimentos: number;
  totalRotas: number;
  totalItems: number;
  totalBeneficiarios: number;
  atendimentosPorMes: Array<{
    mes: string;
    quantidade: number;
  }>;
  itemsMaisAtendidos: Array<{
    item: string;
    quantidade: number;
  }>;
  rotasPorBairro: Array<{
    bairro: string;
    quantidade: number;
  }>;
}

export interface ValidationErrorDTO {
  field: string;
  message: string;
  value?: any;
}

export interface ErrorResponseDTO {
  success: false;
  error: string;
  code: string;
  details?: ValidationErrorDTO[];
}

export interface CreateTemplatePDFDTO {
  nome: string;
  descricao?: string;
  conteudo: string;
}

export interface UpdateTemplatePDFDTO {
  nome?: string;
  descricao?: string;
  conteudo?: string;
  ativo?: boolean;
}

export interface TemplatePDFResponseDTO {
  id: string;
  nome: string;
  descricao?: string | null;
  conteudo: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}
