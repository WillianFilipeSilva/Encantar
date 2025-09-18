import { EntregaService } from '../../../services/EntregaService';
import { EntregaRepository } from '../../../repositories/EntregaRepository';
import { CreateEntregaDTO, UpdateEntregaDTO } from '../../../models/DTOs';
import { CommonErrors } from '../../../middleware/errorHandler';
import { PrismaClient } from '@prisma/client';

// Mock do repositório
jest.mock('../../../repositories/EntregaRepository');

describe('EntregaService', () => {
  let entregaService: EntregaService;
  let mockRepository: jest.Mocked<EntregaRepository>;
  const prisma = new PrismaClient();

  // Dados de exemplo para testes
  const validEntrega: CreateEntregaDTO = {
    beneficiarioId: 'benef-123',
    rotaId: 'rota-123',
    observacoes: 'Observação teste',
    items: [
      { itemId: 'item-1', quantidade: 2 },
      { itemId: 'item-2', quantidade: 1 }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new EntregaRepository(prisma) as jest.Mocked<EntregaRepository>;
    entregaService = new EntregaService(mockRepository);
  });

  describe('create', () => {
    it('deve criar uma entrega com dados válidos', async () => {
      // Arrange
      const userId = 'user-123';
      const expectedEntrega = {
        id: 'entrega-123',
        beneficiarioId: validEntrega.beneficiarioId,
        rotaId: validEntrega.rotaId,
        observacoes: validEntrega.observacoes || null,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        criadoPorId: userId,
        modificadoPorId: null,
        entregaItems: validEntrega.items.map(item => ({
          id: `entrega-item-${item.itemId}`,
          entregaId: 'entrega-123',
          itemId: item.itemId,
          quantidade: item.quantidade,
          criadoEm: new Date(),
          atualizadoEm: new Date()
        }))
      };

      mockRepository.create.mockResolvedValue(expectedEntrega);

      // Act
      const result = await entregaService.create(validEntrega, userId);

      // Assert
      expect(result).toEqual(expectedEntrega);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('deve lançar erro sem beneficiário', async () => {
      // Arrange
      const entregaSemBeneficiario = {
        ...validEntrega,
        beneficiarioId: ''
      };

      // Act & Assert
      await expect(
        entregaService.create(entregaSemBeneficiario, 'user-123')
      ).rejects.toThrow('O beneficiário é obrigatório');

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro sem itens', async () => {
      // Arrange
      const entregaSemItems = {
        ...validEntrega,
        items: []
      };

      // Act & Assert
      await expect(
        entregaService.create(entregaSemItems, 'user-123')
      ).rejects.toThrow('A entrega deve ter pelo menos um item');

      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const entregaId = 'entrega-123';
    const updateData: UpdateEntregaDTO = {
      observacoes: 'Nova observação',
      items: [
        { itemId: 'item-1', quantidade: 3 }
      ]
    };

    it('deve atualizar uma entrega com dados válidos', async () => {
      // Arrange
      const userId = 'user-123';
      const existingEntrega = {
        id: entregaId,
        beneficiarioId: validEntrega.beneficiarioId,
        rotaId: validEntrega.rotaId,
        observacoes: validEntrega.observacoes || null,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        criadoPorId: 'outro-user',
        modificadoPorId: null,
        entregaItems: validEntrega.items.map(item => ({
          id: `entrega-item-${item.itemId}`,
          entregaId,
          itemId: item.itemId,
          quantidade: item.quantidade,
          criadoEm: new Date(),
          atualizadoEm: new Date()
        }))
      };

      const updatedEntrega = {
        ...existingEntrega,
        observacoes: updateData.observacoes || null,
        atualizadoEm: new Date(),
        modificadoPorId: userId,
        entregaItems: updateData.items?.map(item => ({
          id: `entrega-item-${item.itemId}`,
          entregaId,
          itemId: item.itemId,
          quantidade: item.quantidade,
          criadoEm: new Date(),
          atualizadoEm: new Date()
        })) || []
      };

      mockRepository.findById.mockResolvedValue(existingEntrega);
      mockRepository.update.mockResolvedValue(updatedEntrega);

      // Act
      const result = await entregaService.update(entregaId, updateData, userId);

      // Assert
      expect(result).toEqual(updatedEntrega);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('deve lançar erro ao tentar atualizar entrega inexistente', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        entregaService.update(entregaId, updateData, 'user-123')
      ).rejects.toThrow('Registro não encontrado');

      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    const entregaId = 'entrega-123';

    it('deve retornar uma entrega existente', async () => {
      // Arrange
      const expectedEntrega = {
        id: entregaId,
        beneficiarioId: validEntrega.beneficiarioId,
        rotaId: validEntrega.rotaId,
        observacoes: validEntrega.observacoes || null,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        criadoPorId: 'user-123',
        modificadoPorId: null
      };

      mockRepository.findById.mockResolvedValue(expectedEntrega);

      // Act
      const result = await entregaService.findById(entregaId);

      // Assert
      expect(result).toEqual(expectedEntrega);
      expect(mockRepository.findById).toHaveBeenCalledWith(entregaId);
    });

    it('deve lançar erro quando entrega não é encontrada', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        entregaService.findById(entregaId)
      ).rejects.toThrow('Registro não encontrado');
    });
  });
});