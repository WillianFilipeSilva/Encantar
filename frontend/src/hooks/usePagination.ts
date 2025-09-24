import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface PaginationParams {
  page: number
  limit: number
  search: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: any // filtros adicionais
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

interface UsePaginationResult<T> {
  data: T[]
  pagination: PaginationResponse<T>['pagination']
  isLoading: boolean
  error: any
  params: PaginationParams
  setPage: (page: number) => void
  setSearch: (search: string) => void
  setLimit: (limit: number) => void
  setSortBy: (field: string, order?: 'asc' | 'desc') => void
  setFilters: (filters: Record<string, any>) => void
  refresh: () => void
}

export function usePagination<T = any>(
  endpoint: string,
  initialParams: Partial<PaginationParams> = {}
): UsePaginationResult<T> {
  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'criadoEm',
    sortOrder: 'desc',
    ...initialParams
  })

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [endpoint, params],
    queryFn: async () => {
      const response = await api.get<PaginationResponse<T>>(endpoint, { params })
      return response.data
    }
  })

  const setPage = (page: number) => {
    setParams(prev => ({ ...prev, page }))
  }

  const setSearch = (search: string) => {
    setParams(prev => ({ ...prev, search, page: 1 })) // Reset para página 1 ao buscar
  }

  const setLimit = (limit: number) => {
    setParams(prev => ({ ...prev, limit, page: 1 }))
  }

  const setSortBy = (field: string, order: 'asc' | 'desc' = 'asc') => {
    setParams(prev => ({ ...prev, sortBy: field, sortOrder: order, page: 1 }))
  }

  const setFilters = (filters: Record<string, any>) => {
    setParams(prev => ({ 
      ...prev, 
      ...filters, 
      page: 1
      // Remove a preservação explícita do search, deixe o sistema gerenciar naturalmente
    }))
  }

  const refresh = () => {
    refetch()
  }

  return {
    data: data?.data || [],
    pagination: data?.pagination || {
      page: params.page,
      limit: params.limit,
      total: 0,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false
    },
    isLoading,
    error,
    params,
    setPage,
    setSearch,
    setLimit,
    setSortBy,
    setFilters,
    refresh
  }
}