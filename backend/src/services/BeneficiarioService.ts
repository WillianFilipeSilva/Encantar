import { BeneficiarioRepository } from "../repositories/BeneficiarioRepository";
import { BaseService } from "./BaseService";
import { Beneficiario } from "@prisma/client";
import {
  CreateBeneficiarioDTO,
  UpdateBeneficiarioDTO,
  BeneficiarioResponseDTO,
} from "../models/DTOs";
import { CommonErrors } from "../middleware/errorHandler";
import { createDateFromString } from "../utils/dateUtils";

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
      _count: { atendimentos: number };
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
    if (limit < 1 || limit > 500) limit = 10;

    // Extrai parâmetros de ordenação dos filtros
    const sortBy = filters?.sortBy;
    const sortOrder = filters?.sortOrder;
    
    // Remove sortBy e sortOrder dos filtros do where
    const { sortBy: _, sortOrder: __, ...whereFilters } = filters || {};

    return this.beneficiarioRepository.findAllWithRelations(
      page,
      limit,
      whereFilters,
      sortBy,
      sortOrder
    );
  }

  /**
   * Busca beneficiário por ID com relacionamentos
   */
  async findByIdWithRelations(id: string): Promise<Beneficiario & {
    criadoPor: { id: string; nome: string };
    modificadoPor: { id: string; nome: string } | null;
    atendimentos: {
      id: string;
      status: string;
      criadoEm: Date;
      rota: {
        id: string;
        nome: string;
      };
    }[];
    _count: {
      atendimentos: number;
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

    if (data.cpf) {
      const cpfExists = await this.beneficiarioRepository.findByCpf(data.cpf);
      if (cpfExists) {
        throw CommonErrors.CONFLICT("Já existe um beneficiário cadastrado com este CPF");
      }
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
    
    if (data.dataNascimento) {
      try {
        if (typeof data.dataNascimento === 'string') {
          processed.dataNascimento = createDateFromString(data.dataNascimento);
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

    if (data.cpf) {
      const cpfExists = await this.beneficiarioRepository.findByCpf(data.cpf, id);
      if (cpfExists) {
        throw CommonErrors.CONFLICT("Já existe um beneficiário cadastrado com este CPF");
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
   * Busca beneficiários para autocomplete (por nome ou endereço)
   */
  async search(searchTerm: string, activeOnly: boolean = true): Promise<Pick<Beneficiario, 'id' | 'nome' | 'endereco' | 'telefone'>[]> {
    if (!searchTerm || searchTerm.trim().length < 1) {
      return [];
    }

    return this.beneficiarioRepository.searchByNomeOrEndereco(searchTerm.trim(), 50);
  }

  /**
   * Busca beneficiários ativos para seleção
   */
  async findActiveForSelection(): Promise<Pick<Beneficiario, 'id' | 'nome' | 'endereco' | 'telefone'>[]> {
    return this.beneficiarioRepository.findActiveForSelection();
  }

  /**
   * Busca top beneficiários com mais atendimentos
   */
  async findTopBeneficiarios(limit: number = 10): Promise<(Beneficiario & { _count: { atendimentos: number } })[]> {
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

    if (data.cpf && data.cpf.trim() !== "" && !this.isValidCPF(data.cpf)) {
      throw CommonErrors.BAD_REQUEST("CPF inválido");
    }

    if (data.cpf && data.cpf.trim() !== "") {
      const existingBeneficiario = await this.beneficiarioRepository.findByCpf(data.cpf);
      if (existingBeneficiario) {
        throw CommonErrors.CONFLICT("Já existe um beneficiário com este CPF");
      }
    }

    if (data.telefone && data.telefone.trim() !== "" && !this.isValidPhone(data.telefone)) {
      throw CommonErrors.BAD_REQUEST("Telefone inválido");
    }

    if (data.dataNascimento && data.dataNascimento.trim() !== "") {
      try {
        createDateFromString(data.dataNascimento);
      } catch (error) {
        throw CommonErrors.BAD_REQUEST("Data de nascimento inválida");
      }
    }
  }

  protected async validateUpdateData(
    data: UpdateBeneficiarioDTO,
    currentId?: string
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
      data.cpf !== undefined &&
      data.cpf !== null &&
      data.cpf.trim() !== "" &&
      !this.isValidCPF(data.cpf)
    ) {
      throw CommonErrors.BAD_REQUEST("CPF inválido");
    }

    if (data.cpf && data.cpf.trim() !== "" && currentId) {
      const existingBeneficiario = await this.beneficiarioRepository.findByCpf(data.cpf, currentId);
      if (existingBeneficiario) {
        throw CommonErrors.CONFLICT("Já existe um beneficiário com este CPF");
      }
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
        createDateFromString(data.dataNascimento);
      } catch (error) {
        throw CommonErrors.BAD_REQUEST("Data de nascimento inválida");
      }
    }
  }

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
      cpf: (beneficiario as any).cpf,
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

  private isValidCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, "");
    
    if (cleanCPF.length !== 11) return false;
    
    if (/^(\d)\1+$/.test(cleanCPF)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    if (parseInt(cleanCPF.charAt(9)) !== digit) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    if (parseInt(cleanCPF.charAt(10)) !== digit) return false;
    
    return true;
  }

  private isValidPhone(phone: string): boolean {
    if (!phone || phone.trim() === "") {
      return true;
    }
    
    const cleanPhone = phone.replace(/\D/g, "");
    
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }
}
