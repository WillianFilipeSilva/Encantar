import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return ''
  
  let dateObj: Date
  
  if (date instanceof Date) {
    dateObj = date
  } else if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const parts = date.split('-')
      const year = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      dateObj = new Date(year, month, day)
    } else {
      dateObj = new Date(date)
    }
  } else {
    return ''
  }
  
  if (isNaN(dateObj.getTime())) return ''
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: BRAZIL_TIMEZONE
  }).format(dateObj)
}

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return ''
  
  const dateObj = date instanceof Date ? date : new Date(date)
  
  if (isNaN(dateObj.getTime())) return ''
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: BRAZIL_TIMEZONE
  }).format(dateObj)
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}