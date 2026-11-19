import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from '../services/api';
import { calculateDaysRemaining, sortFefo, validatePromoPrice, isActionAllowed, REFERENCE_DATE } from '../utils/rules';
import { calculateDashboardKpis } from '../utils/calculations';

export function useInventory() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'inventory' | 'movements' | 'offers'
  
  // Filtros Globais
  const [categoryFilter, setCategoryFilter] = useState('Todas'); // 'Todas' | 'Padaria' | 'Frios e Laticínios' | 'Hortifrúti'
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('Todos'); // 'Todos' | 'Vencido' | 'Vence Hoje/Amanhã' | 'Próximo' | 'Monitoramento' | 'No Prazo'
  
  // Modais e Feedback
  const [isLotModalOpen, setIsLotModalOpen] = useState(false);
  const [destinationModalItem, setDestinationModalItem] = useState(null);
  const [customPriceModalItem, setCustomPriceModalItem] = useState(null);
  const [aiSimulationLoading, setAiSimulationLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Histórico de snapshot para "Desfazer"
  const [historySnapshots, setHistorySnapshots] = useState([]);

  // Inicialização de dados
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const prods = await apiService.getProducts();
      const movs = await apiService.getMovements();
      setProducts(prods);
      setMovements(movs);
      setLoading(false);
    }
    loadData();
  }, []);

  // Sistema de Toasts
  const addToast = useCallback((message, type = 'info', undoAction = null) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, message, type, undoAction };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove após 5 segundos se não tiver sido acionado
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Salvar snapshot para desfazer
  const pushSnapshot = useCallback(() => {
    setHistorySnapshots((prev) => [
      ...prev.slice(-9), // Guarda até 10 estados anteriores
      {
        products: JSON.parse(JSON.stringify(products)),
        movements: JSON.parse(JSON.stringify(movements)),
      },
    ]);
  }, [products, movements]);

  // Desfazer última alteração
  const undoLastAction = useCallback(() => {
    setHistorySnapshots((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setProducts(last.products);
      setMovements(last.movements);
      addToast('Ação desfeita com sucesso.', 'info');
      return prev.slice(0, -1);
    });
  }, [addToast]);

  // 1. Aceitar sugestão da IA (1 clique)
  const acceptAiSuggestion = useCallback(async (productId) => {
    const target = products.find((p) => p.id === productId);
    if (!target || !target.sugestaoIA) return;

    pushSnapshot();
    const suggestedPrice = target.sugestaoIA.precoSugerido;
    const discount = target.sugestaoIA.descontoPercentual;
    const available = (target.quantidadeEmExposicao || 0) + (target.quantidadeNoSelfService || 0);
    const potentialRecovery = available * suggestedPrice;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            precoAtual: suggestedPrice,
            descontoPercentual: discount,
            sugestaoIA: {
              ...p.sugestaoIA,
              status: 'APPROVED',
            },
            justApproved: true,
          };
        }
        return p;
      })
    );

    // Registra movimentação de auditoria
    const mov = {
      produtoId: target.id,
      produtoNome: target.nome,
      lote: target.lote,
      tipo: 'preco_alterado_ia',
      quantidade: available,
      precoUnitario: suggestedPrice,
      precoOriginal: target.precoOriginal,
      responsavel: 'Dona Célia',
      impactoTipo: 'positivo',
      impactoTexto: `+ R$ ${potentialRecovery.toFixed(2).replace('.', ',')} potencial recuperado`,
      observacoes: `Sugestão da IA aceita com desconto de ${discount}%. Preço ajustado para R$ ${suggestedPrice.toFixed(2).replace('.', ',')}.`,
    };

    const res = await apiService.recordMovement(mov);
    setMovements((prev) => [res.movement, ...prev]);

    addToast(
      `Sugestão aplicada: R$ ${suggestedPrice.toFixed(2).replace('.', ',')} · Item em oferta`,
      'success',
      undoLastAction
    );

    // Remove animação de highlight após 1.5s
    setTimeout(() => {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, justApproved: false } : p))
      );
    }, 1500);
  }, [products, pushSnapshot, undoLastAction, addToast]);

  // 2. Rejeitar sugestão da IA
  const rejectAiSuggestion = useCallback(async (productId) => {
    const target = products.find((p) => p.id === productId);
    if (!target || !target.sugestaoIA) return;

    pushSnapshot();

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            sugestaoIA: {
              ...p.sugestaoIA,
              status: 'REJECTED',
            },
          };
        }
        return p;
      })
    );

    const mov = {
      produtoId: target.id,
      produtoNome: target.nome,
      lote: target.lote,
      tipo: 'sugestao_rejeitada',
      quantidade: (target.quantidadeEmExposicao || 0) + (target.quantidadeNoSelfService || 0),
      precoUnitario: target.precoAtual,
      precoOriginal: target.precoOriginal,
      responsavel: 'Dona Célia',
      impactoTipo: 'neutro',
      impactoTexto: 'R$ 0,00',
      observacoes: `Sugestão de preço rejeitada. Preço mantido em R$ ${target.precoOriginal.toFixed(2).replace('.', ',')}.`,
    };

    const res = await apiService.recordMovement(mov);
    setMovements((prev) => [res.movement, ...prev]);

    addToast(
      `Sugestão descartada. Preço mantido em R$ ${target.precoOriginal.toFixed(2).replace('.', ',')}`,
      'info',
      undoLastAction
    );
  }, [products, pushSnapshot, undoLastAction, addToast]);

  // 3. Personalizar Preço
  const customizePrice = useCallback(async (productId, customPrice) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const validation = validatePromoPrice(target.precoOriginal, customPrice, target.precoMinimo);
    if (!validation.valid) {
      addToast(validation.message, 'error');
      return false;
    }

    pushSnapshot();
    const finalPrice = validation.calculatedPrice;
    const discount = validation.discountPercent;
    const available = (target.quantidadeEmExposicao || 0) + (target.quantidadeNoSelfService || 0);
    const potentialRecovery = available * finalPrice;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            precoAtual: finalPrice,
            descontoPercentual: discount,
            sugestaoIA: p.sugestaoIA
              ? { ...p.sugestaoIA, status: 'APPROVED' }
              : null,
            justApproved: true,
          };
        }
        return p;
      })
    );

    const mov = {
      produtoId: target.id,
      produtoNome: target.nome,
      lote: target.lote,
      tipo: 'preco_personalizado',
      quantidade: available,
      precoUnitario: finalPrice,
      precoOriginal: target.precoOriginal,
      responsavel: 'Dona Célia',
      impactoTipo: 'positivo',
      impactoTexto: `+ R$ ${potentialRecovery.toFixed(2).replace('.', ',')} recuperado`,
      observacoes: `Preço personalizado definido manualmente pela gerente para R$ ${finalPrice.toFixed(2).replace('.', ',')} (${discount}% off).`,
    };

    const res = await apiService.recordMovement(mov);
    setMovements((prev) => [res.movement, ...prev]);

    addToast(
      `Preço personalizado aplicado: R$ ${finalPrice.toFixed(2).replace('.', ',')} (${discount}% off)`,
      'success',
      undoLastAction
    );

    setTimeout(() => {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, justApproved: false } : p))
      );
    }, 1500);

    return true;
  }, [products, pushSnapshot, undoLastAction, addToast]);

  // 4. Registrar Destino Operacional
  const registerDestination = useCallback(async (productId, actionType, quantity, notes = '') => {
    const target = products.find((p) => p.id === productId);
    if (!target) return false;

    if (!isActionAllowed(target, actionType)) {
      addToast('Ação não permitida para este lote devido à validade ou estoque.', 'error');
      return false;
    }

    const qty = parseInt(quantity, 10);
    const available = (target.quantidadeEmExposicao || 0) + (target.quantidadeNoSelfService || 0);

    if (isNaN(qty) || qty <= 0 || qty > available) {
      addToast(`Quantidade inválida. Máximo disponível: ${available} un.`, 'error');
      return false;
    }

    pushSnapshot();
    const origPrice = target.precoOriginal;
    const currentPrice = target.precoAtual || target.precoOriginal;

    let impactoTipo = 'positivo';
    let impactoTexto = `+ R$ ${(qty * origPrice).toFixed(2).replace('.', ',')} recuperado`;

    if (actionType === 'descarte') {
      impactoTipo = 'negativo';
      impactoTexto = `− R$ ${(qty * origPrice).toFixed(2).replace('.', ',')} perdido`;
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updated = { ...p };
          if (actionType === 'venda_normal' || actionType === 'venda_promocional') {
            updated.quantidadeEmExposicao = Math.max(0, (p.quantidadeEmExposicao || 0) - qty);
            updated.quantidadeVendida = (p.quantidadeVendida || 0) + qty;
          } else if (actionType === 'self_service_transfer') {
            // Apenas transferência interna, não conta como saída definitiva nem recuperação
            updated.quantidadeEmExposicao = Math.max(0, (p.quantidadeEmExposicao || 0) - qty);
            updated.quantidadeNoSelfService = (p.quantidadeNoSelfService || 0) + qty;
            impactoTipo = 'neutro';
            impactoTexto = 'Transferência interna';
          } else if (actionType === 'utilizacao_self_service') {
            // Utilização efetiva
            updated.quantidadeNoSelfService = Math.max(0, (p.quantidadeNoSelfService || 0) - qty);
            updated.quantidadeUtilizadaSelfService = (p.quantidadeUtilizadaSelfService || 0) + qty;
          } else if (actionType === 'doacao') {
            updated.quantidadeEmExposicao = Math.max(0, (p.quantidadeEmExposicao || 0) - qty);
            updated.quantidadeDoada = (p.quantidadeDoada || 0) + qty;
          } else if (actionType === 'descarte') {
            // Reduz do saldo em exposição prioritariamente
            if (p.quantidadeEmExposicao >= qty) {
              updated.quantidadeEmExposicao -= qty;
            } else {
              const remaining = qty - p.quantidadeEmExposicao;
              updated.quantidadeEmExposicao = 0;
              updated.quantidadeNoSelfService = Math.max(0, (p.quantidadeNoSelfService || 0) - remaining);
            }
            updated.quantidadeDescartada = (p.quantidadeDescartada || 0) + qty;
          }
          return updated;
        }
        return p;
      })
    );

    const actionLabels = {
      venda_normal: 'Venda Normal',
      venda_promocional: 'Venda Promocional',
      self_service_transfer: 'Transferência para Self-Service',
      utilizacao_self_service: 'Utilização Efetiva no Self-Service',
      doacao: 'Doação',
      descarte: 'Descartado',
    };

    const mov = {
      produtoId: target.id,
      produtoNome: target.nome,
      lote: target.lote,
      tipo: actionType,
      quantidade: qty,
      precoUnitario: currentPrice,
      precoOriginal: origPrice,
      responsavel: 'Dona Célia',
      impactoTipo,
      impactoTexto,
      observacoes: notes || `${actionLabels[actionType] || actionType} de ${qty} un. registrada pela gerente.`,
    };

    const res = await apiService.recordMovement(mov);
    setMovements((prev) => [res.movement, ...prev]);

    addToast(`Movimentação registrada: ${actionLabels[actionType]} (${qty} un.)`, 'success', undoLastAction);
    return true;
  }, [products, pushSnapshot, undoLastAction, addToast]);

  // 5. Cadastrar Novo Lote
  const createNewLot = useCallback(async (newLotData) => {
    pushSnapshot();
    const newId = `${newLotData.categoria.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    
    const formattedLot = {
      id: newId,
      nome: newLotData.nome,
      marca: newLotData.marca || 'Padaria Carrefort',
      categoria: newLotData.categoria,
      lote: newLotData.lote,
      quantidadeInicial: Number(newLotData.quantidadeInicial),
      quantidadeEmExposicao: Number(newLotData.quantidadeInicial),
      quantidadeNoSelfService: 0,
      quantidadeVendida: 0,
      quantidadeDoada: 0,
      quantidadeDescartada: 0,
      quantidadeUtilizadaSelfService: 0,
      dataExposicao: newLotData.dataExposicao || REFERENCE_DATE,
      dataValidade: newLotData.dataValidade,
      precoOriginal: Number(newLotData.precoOriginal),
      precoMinimo: Number(newLotData.precoMinimo || (newLotData.precoOriginal * 0.5)),
      precoAtual: Number(newLotData.precoOriginal * (1 - (newLotData.descontoInicial || 0) / 100)),
      descontoPercentual: Number(newLotData.descontoInicial || 0),
      sugestaoIA: null,
      imagemUrl: newLotData.imagemUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      justAdded: true,
    };

    // Solicita análise inicial da IA para o novo lote
    const days = calculateDaysRemaining(formattedLot.dataValidade);
    if (days >= 0 && days <= 5) {
      const iaSuggestion = await apiService.requestAiAnalysis(formattedLot);
      formattedLot.sugestaoIA = iaSuggestion;
    }

    setProducts((prev) => [formattedLot, ...prev]);

    const mov = {
      produtoId: formattedLot.id,
      produtoNome: formattedLot.nome,
      lote: formattedLot.lote,
      tipo: 'cadastro_lote',
      quantidade: formattedLot.quantidadeInicial,
      precoUnitario: formattedLot.precoAtual,
      precoOriginal: formattedLot.precoOriginal,
      responsavel: 'Dona Célia',
      impactoTipo: 'positivo',
      impactoTexto: `+ R$ ${(formattedLot.quantidadeInicial * formattedLot.precoOriginal).toFixed(2).replace('.', ',')} entrada`,
      observacoes: `Novo lote ${formattedLot.lote} cadastrado e colocado em exposição.`,
    };

    const res = await apiService.recordMovement(mov);
    setMovements((prev) => [res.movement, ...prev]);

    addToast(`Lote ${formattedLot.lote} cadastrado · ${formattedLot.quantidadeInicial} un.`, 'success');

    setTimeout(() => {
      setProducts((prev) =>
        prev.map((p) => (p.id === formattedLot.id ? { ...p, justAdded: false } : p))
      );
    }, 1600);

    return true;
  }, [pushSnapshot, addToast]);

  // 6. Rodar Simulação IA (cascata com skeleton)
  const runAiSimulation = useCallback(async () => {
    setAiSimulationLoading(true);
    addToast('Rodando simulação de IA para lotes com validade próxima...', 'info');

    // Simula tempo de processamento da IA
    await new Promise((r) => setTimeout(r, 1200));

    const updated = await Promise.all(
      products.map(async (p) => {
        const days = calculateDaysRemaining(p.dataValidade);
        const available = (p.quantidadeEmExposicao || 0) + (p.quantidadeNoSelfService || 0);

        // Gera sugestão para itens não vencidos com estoque e sem sugestão aprovada
        if (days >= 0 && days <= 7 && available > 0 && (!p.sugestaoIA || p.sugestaoIA.status === 'PENDING')) {
          const sug = await apiService.requestAiAnalysis(p);
          return { ...p, sugestaoIA: sug };
        }
        return p;
      })
    );

    setProducts(updated);
    setAiSimulationLoading(false);
    addToast('Simulação da IA concluída! Sugestões atualizadas na tabela.', 'success');
  }, [products, addToast]);

  // Produtos filtrados apenas por categoria e busca (SEM filtro de urgência)
  // Usado pelos chips de urgência para mostrar contagens reais de cada faixa
  const productsForUrgencyCount = useMemo(() => {
    let result = [...products];

    if (categoryFilter !== 'Todas') {
      result = result.filter((p) => p.categoria.toLowerCase() === categoryFilter.toLowerCase());
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.nome.toLowerCase().includes(q) ||
          p.marca.toLowerCase().includes(q) ||
          p.lote.toLowerCase().includes(q)
      );
    }

    return result;
  }, [products, categoryFilter, searchQuery]);

  // Produtos filtrados e ordenados (inclui filtro de urgência)
  const filteredProducts = useMemo(() => {
    let result = [...productsForUrgencyCount];

    // Filtro por Urgência
    if (urgencyFilter !== 'Todos') {
      result = result.filter((p) => {
        const days = calculateDaysRemaining(p.dataValidade);
        if (urgencyFilter === 'Vencido') return days < 0;
        if (urgencyFilter === 'Vence Hoje/Amanhã') return days === 0 || days === 1;
        if (urgencyFilter === 'Próximo') return days > 1 && days <= 2;
        if (urgencyFilter === 'Monitoramento') return days > 2 && days <= 5;
        if (urgencyFilter === 'No Prazo') return days > 5;
        return true;
      });
    }

    // Ordenação estrita FEFO por padrão
    return sortFefo(result);
  }, [productsForUrgencyCount, urgencyFilter]);

  // Indicadores do Dashboard
  const kpis = useMemo(() => {
    return calculateDashboardKpis(products, movements);
  }, [products, movements]);

  return {
    products,
    filteredProducts,
    productsForUrgencyCount,
    movements,
    loading,
    activeTab,
    setActiveTab,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    urgencyFilter,
    setUrgencyFilter,
    isLotModalOpen,
    setIsLotModalOpen,
    destinationModalItem,
    setDestinationModalItem,
    customPriceModalItem,
    setCustomPriceModalItem,
    aiSimulationLoading,
    toasts,
    removeToast,
    kpis,
    acceptAiSuggestion,
    rejectAiSuggestion,
    customizePrice,
    registerDestination,
    createNewLot,
    runAiSimulation,
    undoLastAction,
  };
}
