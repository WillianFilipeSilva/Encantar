'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { useState, useEffect } from "react"

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
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  onSearchChange: (search: string) => void
  searchPlaceholder?: string
  isLoading?: boolean
}

export function PaginationControls({
  pagination,
  searchValue,
  onPageChange,
  onLimitChange,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  isLoading = false
}: PaginationControlsProps) {
  const [localSearch, setLocalSearch] = useState(searchValue)

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch)
    }, 500)

    return () => clearTimeout(timer)
  }, [localSearch, onSearchChange])

  const generatePageNumbers = () => {
    const pages = []
    const maxVisible = 5
    const page = pagination?.page || 1
    const totalPages = pagination?.totalPages || 1

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
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
      {/* Controles superiores */}
      <div className="flex items-center justify-between gap-4">
        {/* Busca */}
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

        {/* Items por página */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Itens por página:</span>
          <select
            value={(pagination?.limit || 10).toString()}
            onChange={(e) => onLimitChange(parseInt(e.target.value))}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* Informações e navegação */}
      <div className="flex items-center justify-between">
        {/* Info */}
        <div className="text-sm text-gray-600">
          Mostrando {((pagination?.page || 1) - 1) * (pagination?.limit || 10) + 1} a{' '}
          {Math.min((pagination?.page || 1) * (pagination?.limit || 10), pagination?.total || 0)} de{' '}
          {pagination?.total || 0} resultados
        </div>

        {/* Navegação */}
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

          {/* Números das páginas */}
          <div className="flex items-center gap-1">
            {generatePageNumbers().map((pageNum, index) => (
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
            ))}
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