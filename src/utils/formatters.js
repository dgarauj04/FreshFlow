/**
 * Utilitários de formatação de valores e datas para o FreshFlow
 */

export function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  // Aceita YYYY-MM-DD ou objetos Date
  const date = typeof dateString === 'string' && dateString.includes('-')
    ? new Date(dateString + 'T00:00:00')
    : new Date(dateString);
    
  if (isNaN(date.getTime())) return dateString;
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

export function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '—';
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return dateTimeString;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatRelativeDays(daysRemaining) {
  if (daysRemaining < 0) {
    const absDays = Math.abs(daysRemaining);
    return absDays === 1 ? 'vencido há 1 dia' : `vencido há ${absDays} dias`;
  }
  if (daysRemaining === 0) return 'vence hoje';
  if (daysRemaining === 1) return 'vence amanhã';
  return `vence em ${daysRemaining} dias`;
}
