import { BeneficiarioService } from '../services/BeneficiarioService';
import { BeneficiarioRepository } from '../repositories/BeneficiarioRepository';
import { Beneficiario, PrismaClient } from '@prisma/client';
import { CreateBeneficiarioDTO } from '../models/DTOs';

// Mock do BeneficiarioRepository
jest.mock('../repositories/BeneficiarioRepository');

describe('BeneficiarioService', () => {
  let beneficiarioService: BeneficiarioService;
  let mockRepository: jest.Mocked<BeneficiarioRepository>;
  const prismaClient = new PrismaClient();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new BeneficiarioRepository(prismaClient) as jest.Mocked<BeneficiarioRepository>;
    beneficiarioService = new BeneficiarioService(mockRepository);
  });

  describe('create', () => {
    const validBeneficiario: CreateBeneficiarioDTO = {
      nome: 'João Silva',
      endereco: 'Rua das Flores, 123',
      telefone: '11999999999',
      email: 'joao@email.com',
      observacoes: 'Observação teste'
    };

    it('deve criar um beneficiário com dados válidos', async () => {
      const userId = 'user-123';
      const expectedBeneficiario: Beneficiario = {
        id: 'benef-123',
        nome: validBeneficiario.nome,
        endereco: validBeneficiario.endereco,
        telefone: validBeneficiario.telefone || null,
        email: validBeneficiario.email || null,
        observacoes: validBeneficiario.observacoes || null,
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        criadoPorId: userId,
        modificadoPorId: null
      };

      mockRepository.existsByNomeAndEndereco.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue(expectedBeneficiario);

      const result = await beneficiarioService.create(validBeneficiario, userId);

      expect(result).toEqual(expectedBeneficiario);
      expect(mockRepository.existsByNomeAndEndereco).toHaveBeenCalledWith(
        validBeneficiario.nome,
        validBeneficiario.endereco
      );
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('deve lançar erro ao tentar criar beneficiário duplicado', async () => {
      mockRepository.existsByNomeAndEndereco.mockResolvedValue(true);

      await expect(
        beneficiarioService.create(validBeneficiario)
      ).rejects.toThrow('Já existe um beneficiário com este nome e endereço');

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro com email inválido', async () => {
      const beneficiarioEmailInvalido = {
        ...validBeneficiario,
        email: 'email-invalido'
      };

      await expect(
        beneficiarioService.create(beneficiarioEmailInvalido)
      ).rejects.toThrow('Email inválido');

      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });
});