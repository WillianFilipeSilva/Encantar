import { Request, Response, NextFunction } from 'express';
import cache from '../utils/cache';
import logger from '../utils/logger';

/**
 * Interface para opções do middleware de cache
 */
interface CacheOptions {
  ttl?: number; // Tempo de vida em segundos
  key?: (req: Request) => string; // Função para gerar chave do cache
}

/**
 * Middleware para cache de respostas
 */
export const cacheMiddleware = (options: CacheOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Não faz cache de métodos não-GET
    if (req.method !== 'GET') {
      return next();
    }

    // Gera chave do cache
    const key = options.key
      ? options.key(req)
      : `${req.originalUrl || req.url}`;

    try {
      // Verifica se existe no cache
      const cachedResponse = cache.get(key);
      
      if (cachedResponse) {
        logger.debug(`Cache hit: ${key}`);
        return res.json(cachedResponse);
      }

      // Intercepta o método res.json para armazenar no cache
      const originalJson = res.json;
      res.json = function (body) {
        logger.debug(`Cache miss: ${key}`);
        cache.set(key, body, options.ttl);
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('Erro no middleware de cache:', error);
      next();
    }
  };
};