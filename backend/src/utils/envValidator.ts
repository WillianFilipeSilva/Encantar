import logger from './logger';

/**
 * Validação de variáveis de ambiente
 * Garante que valores críticos estejam configurados em produção
 */
export class EnvValidator {
  /**
   * Valida se todas as variáveis obrigatórias estão definidas
   */
  static validateRequired(): void {
    const isProd = process.env.NODE_ENV === 'production';
    const errors: string[] = [];

    // Variáveis obrigatórias sempre
    const requiredAlways = [
      'DATABASE_URL',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
    ];

    // Variáveis obrigatórias em produção
    const requiredInProd = [
      'FRONTEND_URL',
      'NODE_ENV',
    ];

    // Validar variáveis sempre obrigatórias
    for (const envVar of requiredAlways) {
      const value = process.env[envVar];
      if (!value || value.trim() === '') {
        errors.push(`${envVar} não está configurado`);
      }
      
      // Em produção, não permitir valores padrão fracos
      if (isProd && value) {
        if (value.includes('ENCANTAR-SECRET') || value.includes('fallback')) {
          errors.push(`${envVar} está usando valor padrão fraco. Configure um valor forte em produção`);
        }
        if (value.length < 32) {
          errors.push(`${envVar} deve ter pelo menos 32 caracteres em produção`);
        }
      }
    }

    // Validar variáveis de produção
    if (isProd) {
      for (const envVar of requiredInProd) {
        const value = process.env[envVar];
        if (!value || value.trim() === '') {
          errors.push(`${envVar} não está configurado em produção`);
        }
      }

      // Validar que NODE_ENV é realmente 'production'
      if (process.env.NODE_ENV !== 'production') {
        errors.push('NODE_ENV deve ser "production" em produção');
      }
    }

    // Se há erros, falhar no boot
    if (errors.length > 0) {
      logger.error('❌ Erro de configuração de ambiente:');
      errors.forEach(error => logger.error(`  - ${error}`));
      process.exit(1);
    }

    logger.info('✅ Validação de variáveis de ambiente passou');
  }

  /**
   * Valida tipos de variáveis
   */
  static validateTypes(): void {
    const port = process.env.PORT;
    if (port && isNaN(Number(port))) {
      logger.error('❌ PORT deve ser um número');
      process.exit(1);
    }

    const isProd = process.env.NODE_ENV === 'production';
    if (isProd === undefined) {
      logger.warn('⚠️ NODE_ENV não definido, assumindo development');
    }
  }

  /**
   * Log de configuração ativa
   */
  static logConfiguration(): void {
    logger.info('📋 Configuração de ambiente:');
    logger.info(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`  PORT: ${process.env.PORT || 8080}`);
    logger.info(`  DATABASE_URL: ${process.env.DATABASE_URL ? '✓ configurado' : '✗ não configurado'}`);
    logger.info(`  JWT_SECRET: ${process.env.JWT_SECRET ? '✓ configurado' : '✗ não configurado'}`);
    logger.info(`  FRONTEND_URL: ${process.env.FRONTEND_URL || 'https://projeto-encantarfront.up.railway.app'}`);
  }
}
