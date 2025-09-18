import NodeCache from 'node-cache';
import logger from '../logger';

/**
 * Interface para configuração do cache
 */
interface CacheConfig {
  stdTTL: number; // Tempo de vida padrão em segundos
  checkperiod: number; // Período para checar expiração em segundos
}

/**
 * Serviço de cache genérico
 */
class CacheService {
  private cache: NodeCache;
  private readonly defaultTTL: number;

  constructor(config: CacheConfig) {
    this.cache = new NodeCache({
      stdTTL: config.stdTTL,
      checkperiod: config.checkperiod,
    });
    this.defaultTTL = config.stdTTL;

    // Log de eventos do cache
    this.cache.on('set', (key) => {
      logger.debug(`Cache: Item adicionado - ${key}`);
    });

    this.cache.on('del', (key) => {
      logger.debug(`Cache: Item removido - ${key}`);
    });

    this.cache.on('expired', (key) => {
      logger.debug(`Cache: Item expirado - ${key}`);
    });

    this.cache.on('flush', () => {
      logger.debug('Cache: Todos os itens removidos');
    });
  }

  /**
   * Obtém um item do cache
   */
  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  /**
   * Armazena um item no cache
   */
  set<T>(key: string, value: T, ttl: number = this.defaultTTL): boolean {
    return this.cache.set(key, value, ttl);
  }

  /**
   * Remove um item do cache
   */
  del(key: string | string[]): number {
    return this.cache.del(key);
  }

  /**
   * Limpa todo o cache
   */
  flush(): void {
    this.cache.flushAll();
  }

  /**
   * Obtém as estatísticas do cache
   */
  getStats() {
    return this.cache.getStats();
  }

  /**
   * Obtém um item do cache, se não existir, busca e armazena
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const cachedValue = this.get<T>(key);
    if (cachedValue !== undefined) {
      logger.debug(`Cache hit: ${key}`);
      return cachedValue;
    }

    logger.debug(`Cache miss: ${key}`);
    const value = await fetchFn();
    this.set(key, value, ttl);
    return value;
  }
}

// Configuração padrão do cache
const defaultConfig: CacheConfig = {
  stdTTL: 300, // 5 minutos
  checkperiod: 600, // 10 minutos
};

// Exporta uma instância única do serviço de cache
export default new CacheService(defaultConfig);