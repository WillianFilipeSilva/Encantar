import { BeneficiarioRepository } from "../repositories/BeneficiarioRepository";
import { BaseService } from "./BaseService";
import { Beneficiario } from "@prisma/client";
import {
  CreateBeneficiarioDTO,
  UpdateBeneficiarioDTO,
  BeneficiarioResponseDTO,
} from "../models/DTOs";
import { CommonErrors } from "../middleware/errorHandler";

export class BeneficiarioService extends BaseService<
  Beneficiario,
  CreateBeneficiarioDTO,
  UpdateBeneficiarioDTO
> {
  private beneficiarioRepository: BeneficiarioRepository;

  constructor(beneficiarioRepository: BeneficiarioRepository) {
    super(beneficiarioRepository);
    this.beneficiarioRepository = beneficiarioRepository;
  }

  /**
   * Busca todos os beneficiários com relacionamentos
   */
  async findAllWithRelations(
    page: number = 1,
    limit: number = 10,
    filters?: any
  ): Promise<{ 
    data: (Beneficiario & {
      criadoPor: { id: string; nome: string };
      modificadoPor: { id: string; nome: string } | null;
      _count: { entregas: number };
    })[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    return this.beneficiarioRepository.findAllWithRelations(
      page,
      limit,
      filters
    );
  }

  /**
   * Busca beneficiário por ID com relacionamentos
   */
  async findByIdWithRelations(id: string): Promise<Beneficiario & {
    criadoPor: { id: string; nome: string };
    modificadoPor: { id: string; nome: string } | null;
    entregas: {
      id: string;
      entregaItems: {
        id: string;
        item: {
          id: string;
          nome: string;
          descricao: string | null;
        };
      }[];
      rota: {
        id: string;
        nome: string;
      };
    }[];
    _count: {
      entregas: number;
    };
  }> {
    if (!id) {
      throw CommonErrors.BAD_REQUEST("ID é obrigatório");
    }

    const beneficiario =
      await this.beneficiarioRepository.findByIdWithRelations(id);
    if (!beneficiario) {
      throw CommonErrors.NOT_FOUND("Beneficiário não encontrado");
    }

    return beneficiario;
  }

  /**
   * Cria um novo beneficiário
   */
  async create(data: CreateBeneficiarioDTO, userId?: string): Promise<Beneficiario> {
    await this.validateCreateData(data);

    const exists = await this.beneficiarioRepository.existsByNomeAndEndereco(
      data.nome,
      data.endereco
    );

    if (exists) {
      throw CommonErrors.CONFLICT(
        "Já existe um beneficiário com este nome e endereço"
      );
    }

    const processedData = this.processDataForPrisma(data);
    const createData = await this.addAuditData(processedData, userId, "create");
    return this.beneficiarioRepository.create(createData);
  }
  
  /**
   * Processa os dados para garantir compatibilidade com o Prisma
   * Especialmente para campos de data
   */
  private processDataForPrisma(data: CreateBeneficiarioDTO | UpdateBeneficiarioDTO): any {
    const processed: any = { ...data };
    
    // Converte dataNascimento de string para Date se fornecido
    if (data.dataNascimento) {
      try {
        // Adicionando a hora para garantir formato ISO completo
        // Formato "2002-01-10" vira "2002-01-10T00:00:00Z"
        if (typeof data.dataNascimento === 'string') {
          if (data.dataNascimento.includes('T')) {
            processed.dataNascimento = new Date(data.dataNascimento);
          } else {
            processed.dataNascimento = new Date(`${data.dataNascimento}T00:00:00.000Z`);
          }
        }
      } catch (error) {
        console.error("Erro ao converter data de nascimento:", error);
        delete processed.dataNascimento;
      }
    }
    
    return processed;
  }

  /**
   * Atualiza um beneficiário
   */
  async update(id: string, data: UpdateBeneficiarioDTO, userId?: string): Promise<Beneficiario> {
    if (!id) {
      throw CommonErrors.BAD_REQUEST("ID é obrigatório");
    }

    await this.findById(id);
    await this.validateUpdateData(data);

    // Se está alterando nome ou endereço, verifica duplicatas
    if (data.nome || data.endereco) {
      const current = await this.findById(id);
      const nome = data.nome || current.nome;
      const endereco = data.endereco || current.endereco;

      const exists = await this.beneficiarioRepository.existsByNomeAndEndereco(
        nome,
        endereco,
        id
      );

      if (exists) {
        throw CommonErrors.CONFLICT(
          "Já existe um beneficiário com este nome e endereço"
        );
      }
    }

    const processedData = this.processDataForPrisma(data);
    const updateData = await this.addAuditData(processedData, userId, "update");
    return this.beneficiarioRepository.update(id, updateData);
  }

  /**
   * Busca beneficiários por nome
   */
  async findByNome(nome: string, limit: number = 10): Promise<Pick<Beneficiario, 'id' | 'nome' | 'endereco' | 'telefone'>[]> {
    if (!nome || nome.trim().length < 2) {
      throw CommonErrors.BAD_REQUEST("Nome deve ter pelo menos 2 caracteres");
    }

    return this.beneficiarioRepository.findByNome(nome.trim(), limit);
  }

  /**
   * Busca beneficiários ativos para seleção
   */
  async findActiveForSelection(): Promise<Pick<Beneficiario, 'id' | 'nome' | 'endereco' | 'telefone'>[]> {
    return this.beneficiarioRepository.findActiveForSelection();
  }

  /**
   * Busca top beneficiários com mais entregas
   */
  async findTopBeneficiarios(limit: number = 10): Promise<(Beneficiario & { _count: { entregas: number } })[]> {
    if (limit < 1 || limit > 50) limit = 10;

    return this.beneficiarioRepository.findTopBeneficiarios(limit);
  }

  /**
   * Valida dados de criação
   */
  protected async validateCreateData(
    data: CreateBeneficiarioDTO
  ): Promise<void> {
    if (!data.nome || data.nome.trim().length < 2) {
      throw CommonErrors.BAD_REQUEST("Nome deve ter pelo menos 2 caracteres");
    }

    if (!data.endereco || data.endereco.trim().length < 5) {
      throw CommonErrors.BAD_REQUEST(
        "Endereço deve ter pelo menos 5 caracteres"
      );
    }

    if (data.email && data.email.trim() !== "" && !this.isValidEmail(data.email)) {
      throw CommonErrors.BAD_REQUEST("Email inválido");
    }

    if (data.telefone && data.telefone.trim() !== "" && !this.isValidPhone(data.telefone)) {
      throw CommonErrors.BAD_REQUEST("Telefone inválido");
    }

    if (data.dataNascimento && data.dataNascimento.trim() !== "") {
      try {
        new Date(data.dataNascimento);
      } catch (error) {
        throw CommonErrors.BAD_REQUEST("Data de nascimento inválida");
      }
    }
  }

  /**
   * Valida dados de atualização
   */
  protected async validateUpdateData(
    data: UpdateBeneficiarioDTO
  ): Promise<void> {
    if (
      data.nome !== undefined &&
      (!data.nome || data.nome.trim().length < 2)
    ) {
      throw CommonErrors.BAD_REQUEST("Nome deve ter pelo menos 2 caracteres");
    }

    if (
      data.endereco !== undefined &&
      (!data.endereco || data.endereco.trim().length < 5)
    ) {
      throw CommonErrors.BAD_REQUEST(
        "Endereço deve ter pelo menos 5 caracteres"
      );
    }

    if (
      data.email !== undefined &&
      data.email !== null &&
      data.email.trim() !== "" &&
      !this.isValidEmail(data.email)
    ) {
      throw CommonErrors.BAD_REQUEST("Email inválido");
    }

    if (
      data.telefone !== undefined &&
      data.telefone !== null &&
      data.telefone.trim() !== "" &&
      !this.isValidPhone(data.telefone)
    ) {
      throw CommonErrors.BAD_REQUEST("Telefone inválido");
    }

    if (data.dataNascimento !== undefined && data.dataNascimento !== null && data.dataNascimento.trim() !== "") {
      try {
        new Date(data.dataNascimento);
      } catch (error) {
        throw CommonErrors.BAD_REQUEST("Data de nascimento inválida");
      }
    }
  }

  /**
   * Transforma dados do beneficiário para resposta
   */
  private transformBeneficiarioData(
    beneficiario: Beneficiario & {
      criadoPor?: { id: string; nome: string };
      modificadoPor?: { id: string; nome: string } | null;
    }
  ): BeneficiarioResponseDTO {
    return {
      id: beneficiario.id,
      nome: beneficiario.nome,
      endereco: beneficiario.endereco,
      telefone: beneficiario.telefone,
      email: beneficiario.email,
      observacoes: beneficiario.observacoes,
      ativo: beneficiario.ativo,
      criadoEm: beneficiario.criadoEm,
      atualizadoEm: beneficiario.atualizadoEm,
      criadoPor: {
        id: beneficiario.criadoPorId,
        nome: beneficiario.criadoPor?.nome || 'Desconhecido'
      },
      modificadoPor: beneficiario.modificadoPorId && beneficiario.modificadoPor
        ? {
            id: beneficiario.modificadoPorId,
            nome: beneficiario.modificadoPor.nome
          }
        : undefined,
    };
  }

  /**
   * Valida formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida formato de telefone brasileiro
   */
  private isValidPhone(phone: string): boolean {
    if (!phone || phone.trim() === "") {
      return true;
    }
    
    // Remove caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, "");
    
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }
}
