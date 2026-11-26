/**
 * FreshFlow — Camada Centralizada de Serviços e Integrações
 *
 * Responsável pela comunicação entre o Front-end e o Make.com / Google Sheets / IA.
 * Suporta modo demonstrativo seguro e integração real via Webhooks configurados em .env.
 */

import { INITIAL_PRODUCTS, INITIAL_MOVEMENTS } from '../data/mock';
import { calculateDaysRemaining } from '../utils/rules';

// URL do webhook configurável no .env (mantida como placeholder em branco até fornecimento pela equipe)
const MAKE_WEBHOOK_BASE_URL = import.meta.env.VITE_MAKE_WEBHOOK_URL || 'http://[SUA_URL_AQUI].com';
const IS_MOCK_MODE = !import.meta.env.VITE_MAKE_WEBHOOK_URL || import.meta.env.VITE_MAKE_WEBHOOK_URL.includes('[SUA_URL_AQUI]');

/**
 * Helper genérico para chamadas de webhook do Make.com com timeout e tratamento de erros
 */
async function callMakeWebhook(endpoint, data = {}, timeoutMs = 8000) {
  if (IS_MOCK_MODE) {
    // Simula latência de rede realista para modo de demonstração
    await new Promise((resolve) => setTimeout(resolve, 350));
    return { success: true, isMock: true, data };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${MAKE_WEBHOOK_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erro na comunicação com Make: HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[FreshFlow API] Falha no webhook ${endpoint}. Operando com fallback local seguro:`, error.message);
    return { success: false, error: error.message, fallback: true };
  }
}

export const apiService = {
  /**
   * Consulta produtos e lotes
   */
  async getProducts() {
    const res = await callMakeWebhook('consultar-produtos');
    if (res.success && !res.isMock && Array.isArray(res.products)) {
      return res.products;
    }
    return INITIAL_PRODUCTS;
  },

  /**
   * Cadastra novo lote no Google Sheets via Make
   */
  async createProduct(newLot) {
    const payload = {
      ...newLot,
      criadoEm: new Date().toISOString(),
      loja: 'Loja Piloto 01 — Carrefort',
    };
    const res = await callMakeWebhook('cadastrar-lote', payload);
    return { success: true, product: newLot, res };
  },

  /**
   * Solicita atualização de análise por Inteligência Artificial
   */
  async requestAiAnalysis(product) {
    const days = calculateDaysRemaining(product.dataValidade);
    const available = (product.quantidadeEmExposicao || 0) + (product.quantidadeNoSelfService || 0);

    const payload = {
      productId: product.id,
      lotId: product.lote,
      categoria: product.categoria,
      diasRestantes: days,
      quantidadeDisponivel: available,
      precoOriginal: product.precoOriginal,
      precoAtual: product.precoAtual,
      precoMinimo: product.precoMinimo,
    };

    const res = await callMakeWebhook('analisar-ia', payload);

    if (res.success && res.suggestion) {
      return res.suggestion;
    }

    // Sugestão heurística realista para modo mock baseada nas regras de negócio
    let suggestedDiscount = 20;
    let reason = 'Estoque sob monitoramento.';

    if (days <= 0) {
      return null; // Vencidos não recebem sugestão promocional
    } else if (days === 0) {
      suggestedDiscount = 40;
      reason = 'Validade no dia. Giro imediato recomendado para evitar descarte total.';
    } else if (days === 1) {
      suggestedDiscount = 30;
      reason = 'Vencimento em 24h. Recomendado desconto atrativo para aumentar giro.';
    } else if (days <= 2) {
      suggestedDiscount = 25;
      reason = `Validade próxima (restam ${days} dias). Giro acelerado recomendado.`;
    } else if (days <= 5) {
      suggestedDiscount = 15;
      reason = 'Monitoramento preventivo de validade.';
    }

    const calculatedPrice = Number(
      Math.max(product.precoMinimo, product.precoOriginal * (1 - suggestedDiscount / 100)).toFixed(2)
    );

    return {
      id: `SUG-${product.id}-${Date.now().toString().slice(-4)}`,
      precoSugerido: calculatedPrice,
      descontoPercentual: suggestedDiscount,
      justificativa: reason,
      status: 'PENDING',
    };
  },

  /**
   * Aprova sugestão da IA
   */
  async approveAiSuggestion(productId, lotId, precoAprovado, desconto) {
    const payload = {
      productId,
      lotId,
      precoFinal: precoAprovado,
      descontoPercentual: desconto,
      decisao: 'APROVADA',
      decididoPor: ' Célia',
      dataDecisao: new Date().toISOString(),
    };
    return await callMakeWebhook('aprovar-sugestao', payload);
  },

  /**
   * Rejeita sugestão da IA
   */
  async rejectAiSuggestion(productId, lotId) {
    const payload = {
      productId,
      lotId,
      decisao: 'REJEITADA',
      decididoPor: ' Célia',
      dataDecisao: new Date().toISOString(),
    };
    return await callMakeWebhook('rejeitar-sugestao', payload);
  },

  /**
   * Personaliza preço de um lote
   */
  async customizePrice(productId, lotId, novoPreco, novoDesconto) {
    const payload = {
      productId,
      lotId,
      precoFinal: novoPreco,
      descontoPercentual: novoDesconto,
      decisao: 'PERSONALIZADA',
      decididoPor: ' Célia',
      dataDecisao: new Date().toISOString(),
    };
    return await callMakeWebhook('personalizar-preco', payload);
  },

  /**
   * Registra movimentação de estoque
   */
  async recordMovement(movement) {
    const payload = {
      ...movement,
      id: `MOV-${Date.now().toString().slice(-6)}`,
      dataHora: new Date().toISOString(),
      responsavel: ' Célia',
      loja: 'Loja Piloto 01 — Carrefort',
    };
    const res = await callMakeWebhook('registrar-movimentacao', payload);
    return { success: true, movement: payload, res };
  },

  /**
   * Consulta histórico de movimentações
   */
  async getMovements() {
    const res = await callMakeWebhook('consultar-movimentacoes');
    if (res.success && !res.isMock && Array.isArray(res.movements)) {
      return res.movements;
    }
    return INITIAL_MOVEMENTS;
  },
};
