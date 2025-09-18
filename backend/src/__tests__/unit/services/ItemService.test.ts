import { ItemService } from '../../../services/ItemService';
import { ItemRepository } from '../../../repositories/ItemRepository';
import { CreateItemDTO, UpdateItemDTO } from '../../../models/DTOs';
import { CommonErrors } from '../../../middleware/errorHandler';
import { PrismaClient } from '@prisma/client';

// Mock do repositório
jest.mock('../../../repositories/ItemRepository');

describe('ItemService', () => {
  let itemService: ItemService;
  let mockRepository: jest.Mocked<ItemRepository>;
  const prisma = new PrismaClient();

  // Dados de exemplo para testes
  const validItem: CreateItemDTO = {
    nome: 'Arroz',
    descricao: 'Arroz tipo 1, pacote 5kg',
    unidade: 'kg'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new ItemRepository(prisma) as jest.Mocked<ItemRepository>;
    itemService = new ItemService(mockRepository);
  });

  describe('create', () => {
    it('deve criar um item com dados válidos', async () => {
      // Arrange
      const userId = 'user-123';
      const expectedItem = {
        ...validItem,
        id: 'item-123',
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        criadoPorId: userId,
        modificadoPorId: null,
        descricao: validItem.descricao || null
      };

      mockRepository.existsByNomeAndUnidade.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue(expectedItem);

      // Act
      const result = await itemService.create(validItem, userId);

      // Assert
      expect(result).toEqual(expectedItem);
      expect(mockRepository.existsByNomeAndUnidade).toHaveBeenCalledWith(
        validItem.nome,
        validItem.unidade
      );
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('deve lançar erro ao tentar criar item duplicado', async () => {
      // Arrange
      mockRepository.existsByNomeAndUnidade.mockResolvedValue(true);

      // Act & Assert
      await expect(
        itemService.create(validItem)
      ).rejects.toThrow('Já existe um item com este nome e unidade');

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro com nome muito curto', async () => {
      // Arrange
      const itemNomeCurto = {
        ...validItem,
        nome: 'A' // Nome muito curto
      };

      // Act & Assert
      await expect(
        itemService.create(itemNomeCurto)
      ).rejects.toThrow('O nome do item deve ter pelo menos 2 caracteres');

      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const itemId = 'item-123';
    const updateData: UpdateItemDTO = {
      nome: 'Arroz Atualizado',
      descricao: 'Nova descrição'
    };

    it('deve atualizar um item com dados válidos', async () => {
      // Arrange
      const userId = 'user-123';
      const existingItem = {
        ...validItem,
        id: itemId,
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        criadoPorId: 'outro-user',
        modificadoPorId: null,
        descricao: validItem.descricao || null
      };

      const updatedItem = {
        ...existingItem,
        ...updateData,
        atualizadoEm: new Date(),
        modificadoPorId: userId
      };

      mockRepository.findById.mockResolvedValue(existingItem);
      mockRepository.existsByNomeAndUnidade.mockResolvedValue(false);
      mockRepository.update.mockResolvedValue(updatedItem);

      // Act
      const result = await itemService.update(itemId, updateData, userId);

      // Assert
      expect(result).toEqual(updatedItem);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('deve lançar erro ao tentar atualizar item inexistente', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        itemService.update(itemId, updateData)
      ).rejects.toThrow('Registro não encontrado');

      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('findAllWithFilters', () => {
    it('deve retornar lista de itens com paginação', async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const expectedResponse = {
        data: [
          {
            id: 'item-1',
            nome: 'Item 1',
            unidade: 'un',
            descricao: 'Descrição 1',
            ativo: true,
            criadoEm: new Date(),
            atualizadoEm: new Date(),
            criadoPorId: 'user-1',
            modificadoPorId: null
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      mockRepository.findAllWithRelations.mockResolvedValue(expectedResponse);

      // Act
      const result = await itemService.findAllWithRelations(page, limit);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockRepository.findAllWithRelations).toHaveBeenCalledWith(
        page,
        limit,
        undefined
      );
    });
  });
});