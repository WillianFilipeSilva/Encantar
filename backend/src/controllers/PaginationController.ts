// Backend - Controller Base para Paginação
import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface PaginationQuery {
  page?: string
  limit?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface PaginationResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

export class BaseController {
  protected async paginate<T>(
    model: any,
    query: PaginationQuery,
    searchFields: string[] = [],
    include?: any,
    additionalWhere?: any
  ): Promise<PaginationResponse<T>> {
    const page = parseInt(query.page || '1')
    const limit = parseInt(query.limit || '10')
    const search = query.search || ''
    const sortBy = query.sortBy || 'criadoEm'
    const sortOrder = query.sortOrder || 'desc'

    const skip = (page - 1) * limit

    // Construir condições de busca
    const searchConditions = search
      ? {
          OR: searchFields.map(field => ({
            [field]: {
              contains: search,
              mode: 'insensitive'
            }
          }))
        }
      : {}

    const whereClause = {
      ...searchConditions,
      ...additionalWhere
    }

    // Buscar dados com paginação
    const [data, total] = await Promise.all([
      model.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include
      }),
      model.count({ where: whereClause })
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    }
  }
}

// Beneficiários Controller
export class BeneficiarioController extends BaseController {
  async index(req: Request, res: Response) {
    try {
      const result = await this.paginate(
        prisma.beneficiario,
        req.query,
        ['nome', 'endereco', 'telefone', 'email', 'observacoes'], // campos de busca
        undefined, // include
        { ativo: true } // filtro adicional - só ativos
      )

      res.json(result)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar beneficiários' })
    }
  }
}

// Itens Controller
export class ItemController extends BaseController {
  async index(req: Request, res: Response) {
    try {
      const result = await this.paginate(
        prisma.item,
        req.query,
        ['nome', 'descricao', 'unidade']
      )

      res.json(result)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar itens' })
    }
  }
}

// Rotas Controller
export class RotaController extends BaseController {
  async index(req: Request, res: Response) {
    try {
      const { dataInicio, dataFim } = req.query

      // Filtro de data personalizado
      const dateFilter = dataInicio && dataFim ? {
        dataEntrega: {
          gte: new Date(dataInicio as string),
          lte: new Date(dataFim as string)
        }
      } : {}

      const result = await this.paginate(
        prisma.rota,
        req.query,
        ['nome', 'descricao', 'observacoes'],
        { entregas: { include: { beneficiario: true } } }, // incluir entregas
        dateFilter
      )

      res.json(result)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar rotas' })
    }
  }
}