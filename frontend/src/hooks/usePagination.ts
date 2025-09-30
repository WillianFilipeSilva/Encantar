import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface PaginationParams {
  page: number
  limit: number
  search: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: any
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
  forceRefresh: () => Promise<void>
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
      // Limpar parâmetros vazios ou com valor 'all'
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => {
          // Manter parâmetros obrigatórios
          if (['page', 'limit'].includes(key)) return true;
          // Remover strings vazias e valores 'all'
          if (typeof value === 'string' && (value === '' || value === 'all')) return false;
          // Manter outros valores válidos
          return value !== null && value !== undefined;
        })
      );
      
      const response = await api.get<PaginationResponse<T>>(endpoint, { params: cleanParams })
      return response.data
    },
  })

  const setPage = (page: number) => {
    setParams(prev => ({ ...prev, page }))
  }

  const setSearch = (search: string) => {
    setParams(prev => ({ ...prev, search, page: 1 }))
  }

  const setLimit = (limit: number) => {
    setParams(prev => ({ ...prev, limit, page: 1 }))
  }

  const setSortBy = (field: string, order: 'asc' | 'desc' = 'asc') => {
    setParams(prev => ({ ...prev, sortBy: field, sortOrder: order, page: 1 }))
  }

  const setFilters = (newFilters: Record<string, any>) => {
    setParams(prev => {
      const filterKeys = Object.keys(newFilters);
      const hasChanged = filterKeys.some(key => prev[key] !== newFilters[key]);

      return {
        ...prev,
        ...newFilters,
        page: hasChanged ? 1 : prev.page,
      };
    });
  };

  const refresh = () => {
    refetch()
  }

  const forceRefresh = async () => {
    await refetch({ cancelRefetch: true })
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
    refresh,
    forceRefresh
  }
}