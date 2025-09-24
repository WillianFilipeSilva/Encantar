'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, Search } from 'lucide-react'

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

interface TableFiltersProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: FilterConfig[]
  onFiltersChange: (filters: Record<string, string>) => void
  isLoading?: boolean
}

export function TableFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters = [],
  onFiltersChange,
  isLoading = false
}: TableFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    filters.forEach(filter => {
      initial[filter.key] = filter.defaultValue || ''
    })
    return initial
  })

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const clearFilters = () => {
    const clearedFilters: Record<string, string> = {}
    filters.forEach(filter => {
      clearedFilters[filter.key] = filter.defaultValue || ''
    })
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = Object.values(localFilters).some(value => 
    value !== '' && value !== filters.find(f => f.key === Object.keys(localFilters).find(k => localFilters[k] === value))?.defaultValue
  )

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
          disabled={isLoading}
        />
      </div>
      
      {filters.length > 0 && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={hasActiveFilters ? "border-primary" : ""}
              disabled={isLoading}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Filtros</h4>
                <p className="text-sm text-muted-foreground">
                  Configure os filtros e clique em aplicar
                </p>
              </div>
              
              <div className="space-y-3">
                {filters.map((filter) => (
                  <div key={filter.key} className="space-y-2">
                    <label className="text-sm font-medium">{filter.label}</label>
                    
                    {filter.type === 'select' && filter.options && (
                      <Select
                        value={localFilters[filter.key]}
                        onValueChange={(value) => handleFilterChange(filter.key, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={filter.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {filter.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {filter.type === 'input' && (
                      <Input
                        value={localFilters[filter.key]}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        placeholder={filter.placeholder}
                      />
                    )}
                    
                    {filter.type === 'date' && (
                      <Input
                        type="date"
                        value={localFilters[filter.key]}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        placeholder={filter.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Limpar
                </Button>
                <Button onClick={applyFilters}>
                  Aplicar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}