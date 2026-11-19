/**
 * Regras de Negócio Oficiais do FreshFlow
 * - Classificação de Validade (PRD & Grupos de Interface)
 * - Ordenação FEFO (First Expired, First Out)
 * - Validações de Estoque e Destinação
 * - Cálculo e limites de Preços Promocionais
 */

export const REFERENCE_DATE = '2026-11-17'; // Terça-feira, 17/11/2026 - Loja Piloto 01
export const MAX_DISCOUNT_PERCENT = 70; // Teto de desconto comercial permitido no MVP

/**
 * Calcula a diferença em dias entre a data de validade e a data de referência
 */
export function calculateDaysRemaining(validityDateStr, referenceDateStr = REFERENCE_DATE) {
  if (!validityDateStr) return 0;

  const [vYear, vMonth, vDay] = validityDateStr.split('-').map(Number);
  const [rYear, rMonth, rDay] = referenceDateStr.split('-').map(Number);

  const valDate = new Date(Date.UTC(vYear, vMonth - 1, vDay));
  const refDate = new Date(Date.UTC(rYear, rMonth - 1, rDay));

  const diffTime = valDate.getTime() - refDate.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Retorna os metadados de urgência e estilo visual
 */
export function getUrgencyMetadata(daysRemaining) {
  if (daysRemaining < 0) {
    return {
      key: 'vencido',
      label: 'Vencido',
      badgeBg: 'bg-[#FEE2E2]',
      badgeText: 'text-[#B91C1C]',
      badgeBorder: 'border-[#FCA5A5]',
      borderBar: 'bg-[#B91C1C]',
      rowBg: 'bg-[#FEF2F2]/60 hover:bg-[#FEE2E2]/70',
      icon: 'ban', // Alerta / Bloqueio
      filterGroup: 'vencido',
      isBlocked: true,
    };
  }

  if (daysRemaining === 0) {
    return {
      key: 'hoje',
      label: 'Vence Hoje',
      badgeBg: 'bg-[#FFEDD5]',
      badgeText: 'text-[#C2410C]',
      badgeBorder: 'border-[#FDBA74]',
      borderBar: 'bg-[#C2410C]',
      rowBg: 'hover:bg-[#FFF7ED]',
      icon: 'clock',
      filterGroup: 'hoje_amanha',
      isBlocked: false,
    };
  }

  if (daysRemaining === 1) {
    return {
      key: 'amanha',
      label: 'Vence Amanhã',
      badgeBg: 'bg-[#FFEDD5]',
      badgeText: 'text-[#C2410C]',
      badgeBorder: 'border-[#FDBA74]',
      borderBar: 'bg-[#C2410C]',
      rowBg: 'hover:bg-[#FFF7ED]',
      icon: 'clock',
      filterGroup: 'hoje_amanha',
      isBlocked: false,
    };
  }

  if (daysRemaining <= 2) {
    return {
      key: 'proximo',
      label: 'Próximo (2 dias)',
      badgeBg: 'bg-[#FEF3C7]',
      badgeText: 'text-[#B45309]',
      badgeBorder: 'border-[#FCD34D]',
      borderBar: 'bg-[#B45309]',
      rowBg: 'hover:bg-[#FFFBEB]',
      icon: 'hourglass',
      filterGroup: 'proximo',
      isBlocked: false,
    };
  }

  if (daysRemaining <= 5) {
    return {
      key: 'monitoramento',
      label: 'Monitoramento',
      badgeBg: 'bg-[#E0F2FE]',
      badgeText: 'text-[#168AAD]',
      badgeBorder: 'border-[#BAE6FD]',
      borderBar: 'bg-[#168AAD]',
      rowBg: 'hover:bg-[#F0F9FF]',
      icon: 'eye',
      filterGroup: 'monitoramento',
      isBlocked: false,
    };
  }

  return {
    key: 'noprazo',
    label: 'No Prazo',
    badgeBg: 'bg-[#DCFCE7]',
    badgeText: 'text-[#166534]',
    badgeBorder: 'border-[#86EFAC]',
    borderBar: 'bg-[#76C893]',
    rowBg: 'hover:bg-[#F0FDF4]',
    icon: 'check',
    filterGroup: 'noprazo',
    isBlocked: false,
  };
}

/**
 * Ordenação estrita FEFO (First Expired, First Out)
 */
export function sortFefo(items) {
  return [...items].sort((a, b) => {
    const daysA = calculateDaysRemaining(a.dataValidade);
    const daysB = calculateDaysRemaining(b.dataValidade);
    
    // 1. Menor prazo de validade primeiro
    if (daysA !== daysB) {
      return daysA - daysB;
    }
    // 2. Desempate por quantidade disponível decrescente (maior risco de perda)
    const dispA = (a.quantidadeEmExposicao || 0) + (a.quantidadeNoSelfService || 0);
    const dispB = (b.quantidadeEmExposicao || 0) + (b.quantidadeNoSelfService || 0);
    return dispB - dispA;
  });
}

/**
 * Validação comercial de preço promocional
 */
export function validatePromoPrice(originalPrice, customPrice, minPrice = 0) {
  const orig = Number(originalPrice);
  const custom = Number(customPrice);
  const min = Number(minPrice);

  if (isNaN(custom) || custom <= 0) {
    return { valid: false, message: 'O preço deve ser maior que zero.' };
  }
  if (custom > orig) {
    return { valid: false, message: 'O preço promocional não pode ser superior ao original.' };
  }
  if (custom < min) {
    return {
      valid: false,
      message: `O preço não pode ser inferior ao preço mínimo de segurança (R$ ${min.toFixed(2)}).`
    };
  }

  const discountPercent = Math.round(((orig - custom) / orig) * 100);
  if (discountPercent > MAX_DISCOUNT_PERCENT) {
    return {
      valid: false,
      message: `O desconto de ${discountPercent}% ultrapassa o limite comercial máximo permitido (${MAX_DISCOUNT_PERCENT}%).`
    };
  }

  return { valid: true, discountPercent, calculatedPrice: Number(custom.toFixed(2)) };
}

/**
 * Verifica se uma ação operacional é permitida para o lote
 */
export function isActionAllowed(product, actionType) {
  const days = calculateDaysRemaining(product.dataValidade);
  const isExpired = days < 0;
  const available = (product.quantidadeEmExposicao || 0) + (product.quantidadeNoSelfService || 0);

  if (available <= 0) return false;

  // Produtos vencidos SÓ podem ser descartados!
  if (isExpired) {
    return actionType === 'descarte';
  }

  // Se não estiver vencido, qualquer uma das ações é válida
  return true;
}
