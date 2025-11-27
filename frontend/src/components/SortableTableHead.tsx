'use client'

import { TableHead } from "@/components/ui/table"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type SortOrder = 'asc' | 'desc'

interface SortableTableHeadProps {
  children: React.ReactNode
  field: string
  currentSortBy?: string
  currentSortOrder?: SortOrder
  onSort: (field: string, order: SortOrder) => void
  className?: string
}

export function SortableTableHead({
  children,
  field,
  currentSortBy,
  currentSortOrder,
  onSort,
  className
}: SortableTableHeadProps) {
  const isActive = currentSortBy === field
  const sortDescription = isActive
    ? `Ordenado ${currentSortOrder === 'asc' ? 'crescente' : 'decrescente'}`
    : 'Clique para ordenar'
  
  const handleClick = () => {
    if (isActive) {
      onSort(field, currentSortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      const defaultOrder = field.toLowerCase().includes('data') || field.toLowerCase().includes('criado') 
        ? 'desc' 
        : 'asc'
      onSort(field, defaultOrder)
    }
  }

  const SortIcon = () => {
    if (!isActive) {
      return (
        <span className="ml-1" title="Clique para ordenar" aria-label="Clique para ordenar">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
        </span>
      )
    }
    return currentSortOrder === 'asc' 
      ? (
        <span className="ml-1" title="Ordenado em ordem crescente" aria-label="Ordenado em ordem crescente">
          <ArrowUp className="h-3.5 w-3.5" />
        </span>
      )
      : (
        <span className="ml-1" title="Ordenado em ordem decrescente" aria-label="Ordenado em ordem decrescente">
          <ArrowDown className="h-3.5 w-3.5" />
        </span>
      )
  }

  return (
    <TableHead 
      className={cn(
        "cursor-pointer select-none hover:bg-muted/50 transition-colors",
        isActive && "text-foreground",
        className
      )}
      onClick={handleClick}
      title={`${sortDescription} (${typeof children === 'string' ? children : 'coluna'})`}
    >
      <div className="flex items-center">
        {children}
        <SortIcon />
      </div>
    </TableHead>
  )
}
