import { BeneficiarioService } from '../../../services/BeneficiarioService';
import { BeneficiarioRepository } from '../../../repositories/BeneficiarioRepository';
import { CreateBeneficiarioDTO, UpdateBeneficiarioDTO } from '../../../models/DTOs';
import { CommonErrors } from '../../../middleware/errorHandler';

// Mock do repositório
jest.mock('../../../repositories/BeneficiarioRepository');

describe('BeneficiarioService', () => {
  let beneficiarioService: BeneficiarioService;
  let mockRepository: jest.Mocked<BeneficiarioRepository>;
  
  // Dados de exemplo para testes
  const validBeneficiario: CreateBeneficiarioDTO = {
    nome: 'João Silva',
    endereco: 'Rua das Flores, 123',
    telefone: '11999999999',
    email: 'joao@email.com',
    observacoes: 'Observação teste'
  };

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    
    // Cria uma nova instância do repositório mockado
    mockRepository = new BeneficiarioRepository(null) as jest.Mocked<BeneficiarioRepository>;
    
    // Cria uma nova instância do serviço com o repositório mockado
    beneficiarioService = new BeneficiarioService(mockRepository);
  });

  describe('create', () => {
    it('deve criar um beneficiário com dados válidos', async () => {
      // Arrange (Preparação)
      const userId = 'user-123';
      const expectedBeneficiario = {
        ...validBeneficiario,
        id: 'benef-123',
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        criadoPorId: userId,
        modificadoPorId: null,
        telefone: validBeneficiario.telefone || null,
        email: validBeneficiario.email || null,
        observacoes: validBeneficiario.observacoes || null
      };

      // Configura o mock para simular que não existe beneficiário com mesmo nome/endereço
      mockRepository.existsByNomeAndEndereco.mockResolvedValue(false);
      // Configura o mock para retornar o beneficiário criado
      mockRepository.create.mockResolvedValue(expectedBeneficiario);

      // Act (Ação)
      const result = await beneficiarioService.create(validBeneficiario, userId);

      // Assert (Verificação)
      expect(result).toEqual(expectedBeneficiario);
      expect(mockRepository.existsByNomeAndEndereco).toHaveBeenCalledWith(
        validBeneficiario.nome,
        validBeneficiario.endereco
      );
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('deve lançar erro ao tentar criar beneficiário duplicado', async () => {
      // Arrange
      mockRepository.existsByNomeAndEndereco.mockResolvedValue(true);

      // Act & Assert
      await expect(
        beneficiarioService.create(validBeneficiario)
      ).rejects.toThrow('Já existe um beneficiário com este nome e endereço');

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro com email inválido', async () => {
      // Arrange
      const beneficiarioEmailInvalido = {
        ...validBeneficiario,
        email: 'email-invalido'
      };

      // Act & Assert
      await expect(
        beneficiarioService.create(beneficiarioEmailInvalido)
      ).rejects.toThrow('Email inválido');

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro com telefone inválido', async () => {
      // Arrange
      const beneficiarioTelefoneInvalido = {
        ...validBeneficiario,
        telefone: '123'
      };

      // Act & Assert
      await expect(
        beneficiarioService.create(beneficiarioTelefoneInvalido)
      ).rejects.toThrow('Telefone inválido');

      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const beneficiarioId = 'benef-123';
    const updateData: UpdateBeneficiarioDTO = {
      nome: 'João Silva Atualizado',
      endereco: 'Nova Rua, 456'
    };

    it('deve atualizar um beneficiário com dados válidos', async () => {
      // Arrange
      const userId = 'user-123';
      const existingBeneficiario = {
        ...validBeneficiario,
        id: beneficiarioId,
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        criadoPorId: 'outro-user',
        modificadoPorId: null,
        telefone: validBeneficiario.telefone || null,
        email: validBeneficiario.email || null,
        observacoes: validBeneficiario.observacoes || null
      };

      const updatedBeneficiario = {
        ...existingBeneficiario,
        ...updateData,
        atualizadoEm: new Date(),
        modificadoPorId: userId
      };

      mockRepository.findById.mockResolvedValue(existingBeneficiario);
      mockRepository.existsByNomeAndEndereco.mockResolvedValue(false);
      mockRepository.update.mockResolvedValue(updatedBeneficiario);

      // Act
      const result = await beneficiarioService.update(beneficiarioId, updateData, userId);

      // Assert
      expect(result).toEqual(updatedBeneficiario);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('deve lançar erro ao tentar atualizar beneficiário inexistente', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        beneficiarioService.update(beneficiarioId, updateData)
      ).rejects.toThrow(CommonErrors.NOT_FOUND('Registro não encontrado').message);

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('deve lançar erro ao tentar atualizar para nome/endereço já existente', async () => {
      // Arrange
      const existingBeneficiario = {
        ...validBeneficiario,
        id: beneficiarioId,
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        criadoPorId: 'outro-user',
        modificadoPorId: null,
        telefone: validBeneficiario.telefone || null,
        email: validBeneficiario.email || null,
        observacoes: validBeneficiario.observacoes || null
      };

      mockRepository.findById.mockResolvedValue(existingBeneficiario);
      mockRepository.existsByNomeAndEndereco.mockResolvedValue(true);

      // Act & Assert
      await expect(
        beneficiarioService.update(beneficiarioId, updateData)
      ).rejects.toThrow('Já existe um beneficiário com este nome e endereço');

      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });
});