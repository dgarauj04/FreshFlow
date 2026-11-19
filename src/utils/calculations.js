import { calculateDaysRemaining } from './rules';

/**
 * Cálculos dinâmicos de KPIs e métricas do FreshFlow
 */

export function calculateDashboardKpis(products, movements) {
  // 1. Produtos com vencimento crítico (Vence Hoje ou Amanhã)
  let venceHojeCount = 0;
  let venceAmanhaCount = 0;
  let pendentesIaCount = 0;
  let potencialIaEconomia = 0;

  products.forEach((p) => {
    const days = calculateDaysRemaining(p.dataValidade);
    if (days === 0) venceHojeCount++;
    if (days === 1) venceAmanhaCount++;

    if (p.sugestaoIA && p.sugestaoIA.status === 'PENDING') {
      pendentesIaCount++;
      const disp = (p.quantidadeEmExposicao || 0) + (p.quantidadeNoSelfService || 0);
      const diffPreco = (p.precoOriginal || 0) - (p.sugestaoIA.precoSugerido || 0);
      potencialIaEconomia += Math.max(0, diffPreco * disp);
    }
  });

  const atencaoCriticaTotal = venceHojeCount + venceAmanhaCount;

  // 2. Total de recuperação a partir das movimentações e histórico
  let unidadesRecuperadas = 0;
  let valorRecuperado = 0;
  let unidadesDescartadas = 0;
  let valorDescartado = 0;

  // Movimentações operacionais registradas
  movements.forEach((m) => {
    const qtd = Number(m.quantidade) || 0;
    const precoOrig = Number(m.precoOriginal) || Number(m.precoUnitario) || 0;

    if (['venda_promocional', 'doacao', 'utilizacao_self_service', 'venda_normal'].includes(m.tipo)) {
      unidadesRecuperadas += qtd;
      valorRecuperado += qtd * precoOrig;
    } else if (m.tipo === 'descarte') {
      unidadesDescartadas += qtd;
      valorDescartado += qtd * precoOrig;
    }
  });

  // Também somamos histórico consolidado dos 51 produtos se existirem valores pré-registrados
  products.forEach((p) => {
    const orig = Number(p.precoOriginal) || 0;
    const recQtd = (Number(p.quantidadeVendida) || 0) +
                   (Number(p.quantidadeDoada) || 0) +
                   (Number(p.quantidadeUtilizadaSelfService) || 0);
    const descQtd = Number(p.quantidadeDescartada) || 0;

    unidadesRecuperadas += recQtd;
    valorRecuperado += recQtd * orig;
    unidadesDescartadas += descQtd;
    valorDescartado += descQtd * orig;
  });

  const totalMovimentado = unidadesRecuperadas + unidadesDescartadas;
  const taxaAproveitamento = totalMovimentado > 0
    ? Math.round((unidadesRecuperadas / totalMovimentado) * 100)
    : 91;

  // Distribuição por urgência
  const distribuicaoUrgencia = {
    vencido: 0,
    hojeAmanha: 0,
    proximo: 0,
    monitoramento: 0,
    noPrazo: 0,
    total: products.length,
  };

  products.forEach((p) => {
    const days = calculateDaysRemaining(p.dataValidade);
    if (days < 0) distribuicaoUrgencia.vencido++;
    else if (days <= 1) distribuicaoUrgencia.hojeAmanha++;
    else if (days <= 2) distribuicaoUrgencia.proximo++;
    else if (days <= 5) distribuicaoUrgencia.monitoramento++;
    else distribuicaoUrgencia.noPrazo++;
  });

  return {
    desperdicioEvitadoValor: valorRecuperado,
    alimentosRecuperadosQtd: unidadesRecuperadas,
    atencaoCriticaLotes: atencaoCriticaTotal,
    venceHojeCount,
    venceAmanhaCount,
    sugestoesIaPendentes: pendentesIaCount,
    potencialIaEconomia,
    taxaAproveitamento,
    descartadosQtd: unidadesDescartadas,
    descartadosValor: valorDescartado,
    distribuicaoUrgencia,
  };
}

/**
 * Série temporal de desperdício evitado dos últimos 7 dias
 */
export const DAILY_WASTE_DATA = [
  { dia: 'Qua 11', recuperado: 345.10, descartado: 38.00 },
  { dia: 'Qui 12', recuperado: 398.40, descartado: 42.00 },
  { dia: 'Sex 13', recuperado: 392.10, descartado: 35.00 },
  { dia: 'Sáb 14', recuperado: 410.80, descartado: 48.00 },
  { dia: 'Dom 15', recuperado: 395.60, descartado: 36.00 },
  { dia: 'Seg 16', recuperado: 432.00, descartado: 39.00 },
  { dia: 'Ter 17', recuperado: 473.60, descartado: 43.40, isToday: true },
];
