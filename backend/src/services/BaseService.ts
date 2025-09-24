import { BaseRepository } from "../repositories/BaseRepository";

/**
 * Classe base para todos os services
 * Contém a lógica de negócio comum e validações
 */
export abstract class BaseService<T, CreateData, UpdateData> {
  protected repository: BaseRepository<T, CreateData, UpdateData>;

  constructor(repository: BaseRepository<T, CreateData, UpdateData>) {
    this.repository = repository;
  }

  /**
   * Busca todos os registros com paginação
   */
  async findAll(page: number = 1, limit: number = 10, filters?: any) {
    // Validação de paginação
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    return this.repository.findAll(page, limit, filters);
  }

  /**
   * Busca um registro por ID
   */
  async findById(id: string): Promise<T> {
    if (!id) {
      throw new Error("ID é obrigatório");
    }

    const result = await this.repository.findById(id);
    if (!result) {
      throw new Error("Registro não encontrado");
    }

    return result;
  }

  /**
   * Cria um novo registro
   */
  async create(data: CreateData, userId?: string): Promise<T> {
    // Validação básica
    await this.validateCreateData(data);

    // Adiciona dados de auditoria se necessário
    const createData = await this.addAuditData(data, userId, "create");

    return this.repository.create(createData);
  }

  /**
   * Atualiza um registro
   */
  async update(id: string, data: UpdateData, userId?: string): Promise<T> {
    if (!id) {
      throw new Error("ID é obrigatório");
    }

    // Verifica se o registro existe
    await this.findById(id);

    // Validação básica
    await this.validateUpdateData(data);

    // Adiciona dados de auditoria se necessário
    const updateData = await this.addAuditData(data, userId, "update");

    return this.repository.update(id, updateData);
  }

  /**
   * Remove um registro
   */
  async delete(id: string): Promise<T> {
    if (!id) {
      throw new Error("ID é obrigatório");
    }

    // Verifica se o registro existe
    await this.findById(id);

    return this.repository.delete(id);
  }

  /**
   * Remove um registro permanentemente
   */
  async hardDelete(id: string): Promise<T> {
    if (!id) {
      throw new Error("ID é obrigatório");
    }

    // Verifica se o registro existe
    await this.findById(id);

    return this.repository.hardDelete(id);
  }

  /**
   * Busca registros por critérios
   */
  async findByCriteria(criteria: any, include?: any) {
    return this.repository.findMany(criteria, undefined, include);
  }

  /**
   * Conta registros
   */
  async count(criteria?: any): Promise<number> {
    return this.repository.count(criteria);
  }

  /**
   * Verifica se existe
   */
  async exists(criteria: any): Promise<boolean> {
    return this.repository.exists(criteria);
  }

  /**
   * Método para validação de dados de criação (deve ser implementado nas classes filhas)
   */
  protected async validateCreateData(data: CreateData): Promise<void> {
    // Implementar validações específicas nas classes filhas
  }

  /**
   * Método para validação de dados de atualização (deve ser implementado nas classes filhas)
   */
  protected async validateUpdateData(data: UpdateData): Promise<void> {
    // Implementar validações específicas nas classes filhas
  }

  /**
   * Adiciona dados de auditoria (criadoPor, modificadoPor, etc.)
   */
  protected async addAuditData(
    data: any,
    userId?: string,
    operation: "create" | "update" = "create"
  ): Promise<any> {
    let effectiveUserId = userId;
    
    if (!effectiveUserId) {
      
      try {
        const adminRepo = this.repository as any;
        if (adminRepo.prisma) {
          const admin = await adminRepo.prisma.administrador.findFirst({
            where: { ativo: true },
            select: { id: true }
          });
          
          if (admin) {
            effectiveUserId = admin.id;
          } else {
            throw new Error('Nenhum administrador ativo encontrado para auditoria');
          }
        }
      } catch (error) {
        throw new Error('Erro ao buscar administrador para auditoria');
      }
    }

    const auditData = { ...data };

    if (operation === "create") {
      auditData.criadoPorId = effectiveUserId;
    } else if (operation === "update") {
      auditData.modificadoPorId = effectiveUserId;
    }

    return auditData;
  }

  /**
   * Método para transformar dados antes de retornar (deve ser implementado nas classes filhas)
   */
  protected transformData(data: T): any {
    return data;
  }

  /**
   * Método para transformar lista de dados
   */
  protected transformListData(data: T[]): any[] {
    return data.map((item) => this.transformData(item));
  }
}
