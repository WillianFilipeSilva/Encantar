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
    observacoes?: string;
}
export interface UpdateBeneficiarioDTO {
    nome?: string;
    endereco?: string;
    telefone?: string;
    email?: string;
    observacoes?: string;
    ativo?: boolean;
}
export interface BeneficiarioResponseDTO {
    id: string;
    nome: string;
    endereco: string;
    telefone?: string;
    email?: string;
    observacoes?: string;
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
    unidade: string;
}
export interface UpdateItemDTO {
    nome?: string;
    descricao?: string;
    unidade?: string;
    ativo?: boolean;
}
export interface ItemResponseDTO {
    id: string;
    nome: string;
    descricao?: string;
    unidade: string;
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
export interface CreateEntregaItemDTO {
    itemId: string;
    quantidade: number;
}
export interface CreateEntregaDTO {
    beneficiarioId: string;
    rotaId?: string;
    observacoes?: string;
    items: CreateEntregaItemDTO[];
}
export interface UpdateEntregaItemDTO {
    itemId: string;
    quantidade: number;
}
export interface UpdateEntregaDTO {
    beneficiarioId?: string;
    rotaId?: string;
    observacoes?: string;
    items?: UpdateEntregaItemDTO[];
}
export interface EntregaItemResponseDTO {
    id: string;
    quantidade: number;
    item: ItemResponseDTO;
}
export interface EntregaResponseDTO {
    id: string;
    observacoes?: string;
    criadoEm: Date;
    atualizadoEm: Date;
    beneficiario: BeneficiarioResponseDTO;
    rota?: {
        id: string;
        nome: string;
    };
    entregaItems: EntregaItemResponseDTO[];
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
    dataEntrega?: Date;
    observacoes?: string;
    entregaIds?: string[];
}
export interface UpdateRotaDTO {
    nome?: string;
    descricao?: string;
    dataEntrega?: Date;
    observacoes?: string;
    entregaIds?: string[];
}
export interface RotaResponseDTO {
    id: string;
    nome: string;
    descricao?: string;
    dataEntrega?: Date;
    observacoes?: string;
    criadoEm: Date;
    atualizadoEm: Date;
    entregas: EntregaResponseDTO[];
    criadoPor: {
        id: string;
        nome: string;
    };
    modificadoPor?: {
        id: string;
        nome: string;
    };
}
export interface CreateModeloEntregaDTO {
    nome: string;
    descricao?: string;
    items: Array<{
        itemId: string;
        quantidade: number;
    }>;
}
export interface UpdateModeloEntregaDTO {
    nome?: string;
    descricao?: string;
    ativo?: boolean;
    items?: Array<{
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
    descricao?: string;
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
export interface EntregaFiltersDTO {
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
    dataEntregaInicio?: string;
    dataEntregaFim?: string;
}
export interface DashboardStatsDTO {
    totalEntregas: number;
    totalRotas: number;
    totalItems: number;
    totalBeneficiarios: number;
    entregasPorMes: Array<{
        mes: string;
        quantidade: number;
    }>;
    itemsMaisEntregues: Array<{
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
//# sourceMappingURL=DTOs.d.ts.map