import { RotaService } from '../../../services/RotaService';
import { RotaRepository } from '../../../repositories/RotaRepository';
import { CreateRotaDTO, UpdateRotaDTO } from '../../../models/DTOs';
import { CommonErrors } from '../../../middleware/errorHandler';
import { PrismaClient } from '@prisma/client';

// Mock do repositório
jest.mock('../../../repositories/RotaRepository');

describe('RotaService', () => {
  let rotaService: RotaService;
  let mockRepository: jest.Mocked<RotaRepository>;
  const prisma = new PrismaClient();

  // Dados de exemplo para testes
  const validRota: CreateRotaDTO = {
    nome: 'Rota Centro',
    descricao: 'Rota da região central',
    dataEntrega: new Date('2025-12-25')
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new RotaRepository(prisma) as jest.Mocked<RotaRepository>;
    rotaService = new RotaService(mockRepository);
  });

  describe('create', () => {
    it('deve criar uma rota com dados válidos', async () => {
      // Arrange
      const userId = 'user-123';
      const expectedRota = {
        ...validRota,
        id: 'rota-123',
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        criadoPorId: userId,
        modificadoPorId: null,
        descricao: validRota.descricao || null,
        dataEntrega: validRota.dataEntrega || null,
        observacoes: null
      };

      mockRepository.create.mockResolvedValue(expectedRota);

      // Act
      const result = await rotaService.create(validRota, userId);

      // Assert
      expect(result).toEqual(expectedRota);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('deve lançar erro com nome muito curto', async () => {
      // Arrange
      const rotaNomeCurto = {
        ...validRota,
        nome: 'R' // Nome muito curto
      };

      // Act & Assert
      await expect(
        rotaService.create(rotaNomeCurto, 'user-123')
      ).rejects.toThrow('O nome da rota deve ter pelo menos 3 caracteres');

      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const rotaId = 'rota-123';
    const updateData: UpdateRotaDTO = {
      nome: 'Rota Centro Atualizada',
      descricao: 'Nova descrição'
    };

    it('deve atualizar uma rota com dados válidos', async () => {
      // Arrange
      const userId = 'user-123';
      const existingRota = {
        ...validRota,
        id: rotaId,
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        criadoPorId: 'outro-user',
        modificadoPorId: null,
        descricao: validRota.descricao || null,
        dataEntrega: validRota.dataEntrega || null,
        observacoes: null
      };

      const updatedRota = {
        ...existingRota,
        ...updateData,
        atualizadoEm: new Date(),
        modificadoPorId: userId
      };

      mockRepository.findById.mockResolvedValue(existingRota);
      mockRepository.update.mockResolvedValue(updatedRota);

      // Act
      const result = await rotaService.update(rotaId, updateData, userId);

      // Assert
      expect(result).toEqual(updatedRota);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('deve lançar erro ao tentar atualizar rota inexistente', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        rotaService.update(rotaId, updateData, 'user-123')
      ).rejects.toThrow('Registro não encontrado');

      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('findAllWithFilters', () => {
    it('deve retornar lista de rotas com paginação', async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const expectedResponse = {
        data: [
          {
            id: 'rota-1',
            nome: 'Rota 1',
            descricao: 'Descrição 1',
            dataEntrega: new Date(),
            observacoes: null,
            ativo: true,
            criadoEm: new Date(),
            atualizadoEm: new Date(),
            criadoPorId: 'user-1',
            modificadoPorId: null,
            criadoPor: {
              id: 'user-1',
              nome: 'Admin'
            },
            modificadoPor: null,
            entregas: [],
            _count: {
              entregas: 0
            }
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
      const result = await rotaService.findAllWithRelations(page, limit);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockRepository.findAllWithRelations).toHaveBeenCalledWith(
        page,
        limit,
        undefined
      );
    });
  });

  describe('findByIdWithRelations', () => {
    it('deve retornar uma rota com suas relações', async () => {
      // Arrange
      const rotaId = 'rota-123';
      const expectedRota = {
        id: rotaId,
        nome: 'Rota 1',
        descricao: 'Descrição 1',
        dataEntrega: new Date(),
        observacoes: null,
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        criadoPorId: 'user-1',
        modificadoPorId: null,
        criadoPor: {
          id: 'user-1',
          nome: 'Admin'
        },
        modificadoPor: null,
        entregas: [],
        _count: {
          entregas: 0
        }
      };

      mockRepository.findByIdWithRelations.mockResolvedValue(expectedRota);

      // Act
      const result = await rotaService.findByIdWithRelations(rotaId);

      // Assert
      expect(result).toEqual(expectedRota);
      expect(mockRepository.findByIdWithRelations).toHaveBeenCalledWith(rotaId);
    });

    it('deve lançar erro quando rota não é encontrada', async () => {
      // Arrange
      const rotaId = 'rota-inexistente';
      mockRepository.findByIdWithRelations.mockResolvedValue(null);

      // Act & Assert
      await expect(
        rotaService.findByIdWithRelations(rotaId)
      ).rejects.toThrow('Registro não encontrado');
    });
  });
});