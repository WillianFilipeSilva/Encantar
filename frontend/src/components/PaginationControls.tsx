'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Search, Filter } from "lucide-react"
import { useState, useEffect, useRef } from "react"

interface FilterOption {
  value: string
  label: string
}

interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'input' | 'date'
  options?: FilterOption[]
  placeholder?: string
  defaultValue?: string
}

interface PaginationControlsProps {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
  searchValue: string
  filterValues: Record<string, any>
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  onSearchChange: (search: string) => void
  onFiltersChange: (filters: Record<string, string>) => void
  searchPlaceholder?: string
  isLoading?: boolean
  filters?: FilterConfig[]
}

export function PaginationControls({
  pagination,
  searchValue,
  filterValues,
  onPageChange,
  onLimitChange,
  onSearchChange,
  onFiltersChange,
  searchPlaceholder = "Buscar...",
  isLoading = false,
  filters = [],
}: PaginationControlsProps) {
  const [localSearch, setLocalSearch] = useState(searchValue)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const filtersRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchValue) {
        onSearchChange(localSearch)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [localSearch, onSearchChange, searchValue])

  useEffect(() => {
    setLocalSearch(searchValue)
  }, [searchValue])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setIsFiltersOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleFilterChange = (key: string, value: string) => {
    if (onFiltersChange) {
      onFiltersChange({ ...filterValues, [key]: value })
    }
  }

  const clearFilters = () => {
    const resetFilters: Record<string, string> = {}
    filters.forEach(filter => {
      resetFilters[filter.key] = filter.defaultValue || 'all'
    })
    if (onFiltersChange) {
      onFiltersChange(resetFilters)
    }
  }

  const generatePageNumbers = () => {
    const pages = []
    const maxVisible = 5
    const page = pagination?.page || 1
    const totalPages = pagination?.totalPages || 1

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (page >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = page - 1; i <= page + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    return pages
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>

          {filters.length > 0 && (
            <div className="relative" ref={filtersRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                title="Filtros"
                className="h-10 w-10"
              >
                <Filter className="h-4 w-4" />
              </Button>

              {isFiltersOpen && (
                <div className="absolute top-full mt-2 left-0 bg-white border rounded-lg shadow-lg p-4 min-w-72 z-50">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">Filtros</h3>
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-auto p-1">
                        Limpar
                      </Button>
                    </div>

                    {filters.map((filter) => (
                      <div key={filter.key} className="space-y-2">
                        <label className="text-sm font-medium">{filter.label}</label>
                        {filter.type === 'select' && filter.options ? (
                          <select
                            value={filterValues[filter.key] || 'all'}
                            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                            className="w-full px-3 py-2 border rounded-md text-sm"
                          >
                            {filter.options.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            type={filter.type === 'date' ? 'date' : 'text'}
                            placeholder={filter.placeholder}
                            value={filterValues[filter.key] || ''}
                            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                            className="text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Itens por página:</span>
          <select
            value={(pagination?.limit || 10).toString()}
            onChange={(e) => onLimitChange(parseInt(e.target.value))}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Mostrando {((pagination?.page || 1) - 1) * (pagination?.limit || 50) + 1} a{' '}
          {Math.min((pagination?.page || 1) * (pagination?.limit || 50), pagination?.total || 0)} de{' '}
          {pagination?.total || 0} resultados
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange((pagination?.page || 1) - 1)}
            disabled={!(pagination?.hasPrevious) || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-1">
            {generatePageNumbers().map((pageNum, index) =>
              pageNum === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-400">...</span>
              ) : (
                <Button
                  key={pageNum}
                  variant={pageNum === (pagination?.page || 1) ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum as number)}
                  disabled={isLoading}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              )
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange((pagination?.page || 1) + 1)}
            disabled={!(pagination?.hasNext) || isLoading}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}