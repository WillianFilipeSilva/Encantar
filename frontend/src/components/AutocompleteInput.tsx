'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Option {
  id: string
  label: string
  sublabel?: string
}

interface AutocompleteInputProps {
  placeholder?: string
  value?: string
  onSelect: (option: Option | null) => void
  onSearch: (searchTerm: string) => Promise<Option[]>
  isLoading?: boolean
  disabled?: boolean
  className?: string
  emptyMessage?: string
  minChars?: number
  searchIcon?: boolean
  clearable?: boolean
}

export function AutocompleteInput({
  placeholder = "Digite para buscar...",
  value,
  onSelect,
  onSearch,
  isLoading = false,
  disabled = false,
  className,
  emptyMessage = "Nenhum resultado encontrado",
  minChars = 1,
  searchIcon = true,
  clearable = true
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<Option[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOption, setSelectedOption] = useState<Option | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isSearching, setIsSearching] = useState(false)
  const [shouldSearch, setShouldSearch] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const optionsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  const performSearch = useCallback(async (term: string) => {
    if (term.length < minChars) {
      setOptions([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      const results = await onSearch(term)
      setOptions(results)
      setHighlightedIndex(-1)
    } catch (error) {
      console.error('Erro na busca:', error)
      setOptions([])
    } finally {
      setIsSearching(false)
    }
  }, [onSearch, minChars])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!shouldSearch) {
      return
    }

    if (!searchTerm || searchTerm.length < minChars) {
      setOptions([])
      setIsSearching(false)
      setShouldSearch(false)
      return
    }

    if (selectedOption && searchTerm === selectedOption.label) {
      setShouldSearch(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      performSearch(searchTerm)
      setShouldSearch(false)
    }, 1000)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [searchTerm, selectedOption, shouldSearch, performSearch])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && e.key === 'Enter') {
      setIsOpen(true)
      return
    }

    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < options.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : options.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && options[highlightedIndex]) {
          handleSelectOption(options[highlightedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setHighlightedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSelectOption = (option: Option) => {
    setSelectedOption(option)
    setSearchTerm(option.label)
    setIsOpen(false)
    setHighlightedIndex(-1)
    setIsSearching(false)
    setShouldSearch(false)
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    onSelect(option)
  }

  const handleClear = () => {
    setSelectedOption(null)
    setSearchTerm('')
    setIsOpen(false)
    setOptions([])
    setHighlightedIndex(-1)
    setIsSearching(false)
    setShouldSearch(false)
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    onSelect(null)
    inputRef.current?.focus()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setIsOpen(true)
    
    // Ativar busca apenas quando o usuário digita
    if (value && value.length >= minChars) {
      setShouldSearch(true)
    } else {
      setShouldSearch(false)
    }
    
    // Resetar seleção quando digitar algo diferente
    if (selectedOption && value !== selectedOption.label) {
      setSelectedOption(null)
      onSelect(null)
    }
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            "pr-16",
            searchIcon && "pl-10",
            className
          )}
        />
        
        {searchIcon && (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        )}
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {clearable && searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )} />
        </div>
      </div>

      {/* Dropdown de opções */}
      {isOpen && (
        <div
          ref={optionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {(isLoading || isSearching) ? (
            <div className="p-3 text-center text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Buscando...
              </div>
            </div>
          ) : searchTerm.length < minChars ? (
            <div className="p-3 text-center text-sm text-muted-foreground">
              Digite pelo menos {minChars} caractere{minChars > 1 ? 's' : ''} para buscar
            </div>
          ) : options.length === 0 ? (
            <div className="p-3 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            options.map((option, index) => (
              <div
                key={option.id}
                className={cn(
                  "flex items-center justify-between p-3 cursor-pointer transition-colors",
                  index === highlightedIndex && "bg-accent",
                  selectedOption?.id === option.id && "bg-accent"
                )}
                onClick={() => handleSelectOption(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div>
                  <div className="font-medium">{option.label}</div>
                  {option.sublabel && (
                    <div className="text-sm text-muted-foreground">{option.sublabel}</div>
                  )}
                </div>
                {selectedOption?.id === option.id && (
                  <Check className="h-4 w-4" />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}