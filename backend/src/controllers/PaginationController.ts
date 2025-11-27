import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { createDateFromString, serializeDateForAPI, serializeDateTimeForAPI } from '../utils/dateUtils'

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

export class BeneficiarioController extends BaseController {
  async index(req: Request, res: Response) {
    try {
      const result = await this.paginate(
        prisma.beneficiario,
        req.query,
        ['nome', 'endereco', 'telefone', 'cpf', 'observacoes'],
        undefined,
        { ativo: true }
      )

      res.json(result)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar beneficiários' })
    }
  }
}

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

export class RotaController extends BaseController {
  async index(req: Request, res: Response) {
    try {
      const { dataInicio, dataFim } = req.query

      const dateFilter = dataInicio && dataFim ? {
        dataAtendimento: {
          gte: createDateFromString(dataInicio as string),
          lte: createDateFromString(dataFim as string)
        }
      } : {}

      const result = await this.paginate(
        prisma.rota,
        req.query,
        ['nome', 'descricao', 'observacoes'],
        { atendimentos: { include: { beneficiario: true } } },
        dateFilter
      )

      res.json(result)
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar rotas' })
    }
  }
}