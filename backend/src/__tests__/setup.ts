import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      // Adicione mais mocks conforme necessário
    })),
  };
});