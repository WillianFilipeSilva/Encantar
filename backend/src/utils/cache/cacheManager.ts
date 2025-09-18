import cache from '../utils/cache';
import logger from '../utils/logger';

/**
 * Funções para gerenciar o cache das entidades
 */
export const CacheManager = {
  /**
   * Invalidação de cache para beneficiários
   */
  Beneficiario: {
    // Invalidar cache de um beneficiário específico
    invalidateOne: (id: string) => {
      logger.debug(`Invalidando cache do beneficiário ${id}`);
      cache.del([
        `beneficiario:${id}`,
        'beneficiarios:list',
        'beneficiarios:active',
        'beneficiarios:top',
      ]);
    },

    // Invalidar todo cache relacionado a beneficiários
    invalidateAll: () => {
      logger.debug('Invalidando todo cache de beneficiários');
      // Busca todas as chaves do cache que começam com 'beneficiario'
      const keys = Object.keys(cache.getStats().keys).filter(key => 
        key.startsWith('beneficiario')
      );
      cache.del(keys);
    }
  },

  /**
   * Invalidação de cache para itens
   */
  Item: {
    invalidateOne: (id: string) => {
      logger.debug(`Invalidando cache do item ${id}`);
      cache.del([
        `item:${id}`,
        'items:list',
        'items:active'
      ]);
    },

    invalidateAll: () => {
      logger.debug('Invalidando todo cache de itens');
      const keys = Object.keys(cache.getStats().keys).filter(key => 
        key.startsWith('item')
      );
      cache.del(keys);
    }
  },

  /**
   * Invalidação de cache para rotas
   */
  Rota: {
    invalidateOne: (id: string) => {
      logger.debug(`Invalidando cache da rota ${id}`);
      cache.del([
        `rota:${id}`,
        'rotas:list',
        'rotas:active'
      ]);
    },

    invalidateAll: () => {
      logger.debug('Invalidando todo cache de rotas');
      const keys = Object.keys(cache.getStats().keys).filter(key => 
        key.startsWith('rota')
      );
      cache.del(keys);
    }
  },

  /**
   * Invalidação de cache para entregas
   */
  Entrega: {
    invalidateOne: (id: string) => {
      logger.debug(`Invalidando cache da entrega ${id}`);
      cache.del([
        `entrega:${id}`,
        'entregas:list',
      ]);
    },

    invalidateAll: () => {
      logger.debug('Invalidando todo cache de entregas');
      const keys = Object.keys(cache.getStats().keys).filter(key => 
        key.startsWith('entrega')
      );
      cache.del(keys);
    }
  },

  /**
   * Invalidar todo o cache
   */
  invalidateAll: () => {
    logger.debug('Invalidando todo o cache');
    cache.flush();
  }
};