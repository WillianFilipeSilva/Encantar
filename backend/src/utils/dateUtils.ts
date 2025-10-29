export const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

export function createDateFromString(dateString: string): Date {
  if (!dateString) {
    throw new Error('Data é obrigatória');
  }
  
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    throw new Error('Formato de data inválido. Use YYYY-MM-DD');
  }
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}

export function createBrazilTimestamp(): Date {
  const now = new Date();
  const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: BRAZIL_TIMEZONE }));
  return brazilTime;
}

export function formatDateToString(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    return '';
  }
  
  const year = date.toLocaleDateString('pt-BR', { 
    year: 'numeric', 
    timeZone: BRAZIL_TIMEZONE 
  });
  const month = date.toLocaleDateString('pt-BR', { 
    month: '2-digit', 
    timeZone: BRAZIL_TIMEZONE 
  });
  const day = date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    timeZone: BRAZIL_TIMEZONE 
  });
  
  return `${year}-${month}-${day}`;
}

export function formatBrazilDateTime(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    return '';
  }
  
  return date.toLocaleString('pt-BR', {
    timeZone: BRAZIL_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function serializeDateForAPI(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    const dateObj = new Date(date);
    return formatDateToStringUTC(dateObj);
  }
  
  return formatDateToStringUTC(date);
}

function formatDateToStringUTC(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    return '';
  }
  
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

export function serializeDateTimeForAPI(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return null;
  
  return formatBrazilDateTime(dateObj);
}

export function isDateInRange(date: Date, startDate?: Date, endDate?: Date): boolean {
  if (!date) return false;
  
  const normalizeDate = (d: Date) => {
    const normalized = new Date(d.toLocaleString("en-US", { timeZone: BRAZIL_TIMEZONE }));
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };
  
  const dateOnly = normalizeDate(date);
  
  if (startDate) {
    const startOnly = normalizeDate(startDate);
    if (dateOnly < startOnly) return false;
  }
  
  if (endDate) {
    const endOnly = normalizeDate(endDate);
    if (dateOnly > endOnly) return false;
  }
  
  return true;
}

export function toStartOfDayBrazil(date: Date): Date {
  const brazilDate = new Date(date.toLocaleString("en-US", { timeZone: BRAZIL_TIMEZONE }));
  brazilDate.setHours(0, 0, 0, 0);
  return brazilDate;
}

export function toEndOfDayBrazil(date: Date): Date {
  const brazilDate = new Date(date.toLocaleString("en-US", { timeZone: BRAZIL_TIMEZONE }));
  brazilDate.setHours(23, 59, 59, 999);
  return brazilDate;
}