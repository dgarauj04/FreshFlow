import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Check,
  Edit2,
  X,
  MoreHorizontal,
  Lock,
  Trash2,
  Info,
  HelpCircle,
} from 'lucide-react';
import UrgencyBadge from './UrgencyBadge';
import StockBar from './StockBar';
import { calculateDaysRemaining, getUrgencyMetadata } from '../../utils/rules';
import { formatCurrency, formatDate, formatRelativeDays } from '../../utils/formatters';

export default function InventoryTable({
  products,
  allProductsForCount,
  urgencyFilter,
  onUrgencyFilterChange,
  onAcceptAi,
  onRejectAi,
  onOpenCustomPrice,
  onOpenDestination,
  onRunAiSimulation,
  onRestoreFefo,
  aiSimulationLoading,
}) {
  const [localSearch, setLocalSearch] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [activeTooltipId, setActiveTooltipId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Contagens calculadas sobre o array SEM filtro de urgência,
  // para que os chips sempre mostrem os totais reais de cada faixa,
  // independentemente do chip que estiver ativo no momento.
  const countSource = allProductsForCount ?? products;
  const urgencyCounts = {
    Todos: countSource.length,
    Vencido: countSource.filter((p) => calculateDaysRemaining(p.dataValidade) < 0).length,
    'Vence Hoje/Amanhã': countSource.filter((p) => {
      const d = calculateDaysRemaining(p.dataValidade);
      return d === 0 || d === 1;
    }).length,
    Próximo: countSource.filter((p) => {
      const d = calculateDaysRemaining(p.dataValidade);
      return d > 1 && d <= 2;
    }).length,
    Monitoramento: countSource.filter((p) => {
      const d = calculateDaysRemaining(p.dataValidade);
      return d > 2 && d <= 5;
    }).length,
    'No Prazo': countSource.filter((p) => calculateDaysRemaining(p.dataValidade) > 5).length,
  };

  const urgencyChips = [
    { id: 'Todos', label: 'Todos', count: urgencyCounts.Todos },
    { id: 'Vencido', label: 'Vencido', count: urgencyCounts.Vencido },
    { id: 'Vence Hoje/Amanhã', label: 'Vence Hoje/Amanhã', count: urgencyCounts['Vence Hoje/Amanhã'] },
    { id: 'Próximo', label: 'Próximo', count: urgencyCounts.Próximo },
    { id: 'Monitoramento', label: 'Monitoramento', count: urgencyCounts.Monitoramento },
    { id: 'No Prazo', label: 'No Prazo', count: urgencyCounts['No Prazo'] },
  ];

  // Filtro local adicional de tabela
  const displayItems = products.filter((p) => {
    if (!localSearch.trim()) return true;
    const q = localSearch.toLowerCase();
    return (
      p.nome.toLowerCase().includes(q) ||
      p.marca.toLowerCase().includes(q) ||
      p.lote.toLowerCase().includes(q)
    );
  });

  const toggleSelectAll = () => {
    if (selectedProductIds.length === displayItems.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(displayItems.map((p) => p.id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Sugestões pendentes
  const pendingAiCount = products.filter(
    (p) => p.sugestaoIA && p.sugestaoIA.status === 'PENDING'
  ).length;

  return (
    <section className="space-y-4" aria-label="Gestão de Validades e Lotes">
      {/* 1. Header da Tela */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#184E77]">
            Gestão de Validades & Lotes
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Ordenado por FEFO — hoje, 17/11/2026 · <strong className="text-[#34A0A4]">{pendingAiCount} sugestões da IA</strong> aguardando decisão
          </p>
        </div>

        {/* Botões do Topo Direito */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onRestoreFefo}
            className="px-3 py-2 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#184E77] text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#168AAD]" />
            Restaurar ordem FEFO
          </button>

          <button
            type="button"
            onClick={onRunAiSimulation}
            disabled={aiSimulationLoading}
            className="px-4 py-2 bg-[#34A0A4] hover:bg-[#2e8f93] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-[#D9ED92] ${aiSimulationLoading ? 'animate-spin' : ''}`} />
            {aiSimulationLoading ? 'Analisando...' : 'Rodar Simulação IA'}
          </button>
        </div>
      </div>

      {/* 2. Chips de Filtro por Urgência */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist">
        {urgencyChips.map((chip) => {
          const isActive = urgencyFilter === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onUrgencyFilterChange(chip.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#168AAD] text-white shadow-xs'
                  : 'bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F1F5F9]'
              }`}
            >
              <span>{chip.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-white/25 text-white' : 'bg-[#F1F5F9] text-[#64748B]'
                }`}
              >
                {chip.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Barra de Ferramentas da Tabela */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-xs font-semibold text-[#184E77] whitespace-nowrap">
            {displayItems.length} lotes
          </span>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Filtrar na tabela"
              className="w-full h-8 pl-8 pr-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#184E77] focus:outline-none focus:border-[#1A759F]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-2.5 py-1.5 text-xs text-[#64748B] hover:text-[#184E77] bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Colunas
          </button>
          <button
            type="button"
            onClick={onRestoreFefo}
            className="px-2.5 py-1.5 text-xs text-[#64748B] hover:text-[#184E77] bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Atualizar
          </button>
        </div>
      </div>

      {/* 4. Barra de Ações em Lote Flutuante quando linhas estão selecionadas */}
      {selectedProductIds.length > 0 && (
        <div className="bg-[#184E77] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between animate-in slide-in-from-top-2">
          <span className="text-xs font-semibold">
            {selectedProductIds.length} produtos selecionados
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                selectedProductIds.forEach((id) => onAcceptAi(id));
                setSelectedProductIds([]);
              }}
              className="px-3 py-1 bg-[#76C893] text-[#184E77] text-xs font-bold rounded-lg hover:bg-[#68b884] transition-colors"
            >
              Aceitar IA em lote
            </button>
            <button
              type="button"
              onClick={() => setSelectedProductIds([])}
              className="p-1 text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Tabela FEFO com Cabeçalho Sticky */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="overflow-x-auto max-h-[640px]">
          <table className="w-full text-left text-xs border-collapse">
            {/* Cabeçalho Sticky */}
            <thead className="bg-[#F1F5F9] sticky top-0 z-10 border-b border-[#E2E8F0] text-[#475569] select-none font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 min-w-[130px]">Status / Urgência</th>
                <th className="py-3 px-3 min-w-[200px]">Produto & Setor</th>
                <th className="py-3 px-3 min-w-[110px]">Lote</th>
                <th className="py-3 px-3 min-w-[120px]">Validade</th>
                <th className="py-3 px-3 min-w-[100px]">Estoque</th>
                <th className="py-3 px-3 min-w-[90px]">Preço</th>
                <th className="py-3 px-3 min-w-[160px]">Sugestão da IA</th>
                <th className="py-3 px-3 min-w-[180px] text-right">Ações</th>
              </tr>
            </thead>

            {/* Linhas */}
            <tbody className="divide-y divide-[#F1F5F9]">
              {displayItems.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-[#94A3B8]">
                    Nenhum lote encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                displayItems.map((p) => {
                  const days = calculateDaysRemaining(p.dataValidade);
                  const meta = getUrgencyMetadata(days);
                  const disp = (p.quantidadeEmExposicao || 0) + (p.quantidadeNoSelfService || 0);
                  const isSelected = selectedProductIds.includes(p.id);
                  const hasDiscount = p.descontoPercentual > 0 && p.precoAtual < p.precoOriginal;

                  return (
                    <tr
                      key={p.id}
                      className={`relative transition-colors group ${
                        meta.isBlocked
                          ? 'bg-[#FEF2F2]/60 hover:bg-[#FEE2E2]'
                          : p.justApproved
                          ? 'bg-[#B5E48C]/30'
                          : p.justAdded
                          ? 'bg-[#DCFCE7]/40'
                          : 'hover:bg-[#F8FAFC]'
                      }`}
                    >

                      {/* Status / Urgência */}
                      <td className="py-3.5 px-3">
                        <UrgencyBadge daysRemaining={days} />
                      </td>

                      {/* Produto & Marca */}
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-sm text-[#184E77] leading-tight group-hover:text-[#168AAD] transition-colors">
                          {p.nome}
                        </div>
                        <div className="text-[11px] text-[#94A3B8] leading-tight mt-0.5">
                          {p.marca} · {p.categoria}
                        </div>
                      </td>

                      {/* Lote */}
                      <td className="py-3.5 px-3 font-mono text-[#184E77] text-[11px] font-medium">
                        {p.lote}
                      </td>

                      {/* Validade */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-[#184E77] tabular-nums">
                          {formatDate(p.dataValidade)}
                        </div>
                        <div className={`text-[11px] font-semibold ${meta.badgeText}`}>
                          {formatRelativeDays(days)}
                        </div>
                      </td>

                      {/* Estoque */}
                      <td className="py-3.5 px-3">
                        <StockBar available={disp} total={p.quantidadeInicial} />
                      </td>

                      {/* Preço */}
                      <td className="py-3.5 px-3 tabular-nums">
                        {hasDiscount ? (
                          <div>
                            <span className="line-through text-[#94A3B8] text-[11px] block">
                              {formatCurrency(p.precoOriginal)}
                            </span>
                            <span className="font-bold text-sm text-[#76C893]">
                              {formatCurrency(p.precoAtual)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-sm text-[#184E77]">
                            {formatCurrency(p.precoOriginal)}
                          </span>
                        )}
                      </td>

                      {/* Sugestão da IA */}
                      <td className="py-3.5 px-3">
                        {meta.isBlocked ? (
                          <span className="text-[#94A3B8] italic">— (bloqueado)</span>
                        ) : p.sugestaoIA && p.sugestaoIA.status === 'PENDING' ? (
                          <div className="space-y-1 relative">
                            {/* Chip interativo da IA com pulso */}
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E0F2FE] border border-[#BAE6FD] text-[#168AAD] font-semibold text-xs ai-pulse shadow-xs">
                              <Sparkles className="w-3.5 h-3.5 text-[#34A0A4]" />
                              <span>{formatCurrency(p.sugestaoIA.precoSugerido)}</span>
                              <span className="text-[#1A759F]">
                                (−{p.sugestaoIA.descontoPercentual}%)
                              </span>
                            </div>

                            {/* Link Por quê? com Tooltip */}
                            <div className="relative inline-block ml-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveTooltipId(activeTooltipId === p.id ? null : p.id)
                                }
                                className="text-[11px] text-[#168AAD] hover:underline flex items-center gap-0.5"
                              >
                                Por quê?
                              </button>

                              {activeTooltipId === p.id && (
                                <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-[#184E77] text-white text-xs rounded-xl shadow-popover z-30">
                                  <div className="font-bold flex items-center gap-1.5 text-[#D9ED92] mb-1">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Justificativa da IA:
                                  </div>
                                  <p className="text-[#E2F0F7] leading-relaxed">
                                    {p.sugestaoIA.justificativa}
                                  </p>
                                  <div className="mt-2 pt-1 border-t border-white/10 text-[10px] text-[#94A3B8]">
                                    Economia estimada no lote: {formatCurrency((p.precoOriginal - p.sugestaoIA.precoSugerido) * disp)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : p.sugestaoIA && p.sugestaoIA.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
                            ✓ Aprovada
                          </span>
                        ) : p.sugestaoIA && p.sugestaoIA.status === 'REJECTED' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md">
                            ✕ Rejeitada
                          </span>
                        ) : (
                          <span className="text-[#94A3B8]">—</span>
                        )}
                      </td>

                      {/* Ações Rápidas */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {meta.isBlocked ? (
                            <>
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#B91C1C]">
                                <Lock className="w-3.5 h-3.5" />
                                Bloqueado
                              </span>
                              <button
                                type="button"
                                onClick={() => onOpenDestination(p, 'descarte')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#B91C1C] hover:bg-[#FEE2E2] rounded-lg transition-colors border border-[#FCA5A5]"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Descartar
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Botão Aceitar IA */}
                              {p.sugestaoIA && p.sugestaoIA.status === 'PENDING' && (
                                <button
                                  type="button"
                                  onClick={() => onAcceptAi(p.id)}
                                  className="h-8 px-2.5 bg-[#76C893] hover:bg-[#68b884] text-[#184E77] text-xs font-bold rounded-lg shadow-xs flex items-center gap-1 transition-all active:scale-95"
                                  title="Aceitar preço sugerido pela IA com 1 clique"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  Aceitar IA
                                </button>
                              )}

                              {/* Botão Personalizar Preço */}
                              <button
                                type="button"
                                onClick={() => onOpenCustomPrice(p)}
                                className="h-8 px-2 bg-white hover:bg-[#F1F5F9] text-[#1A759F] border border-[#1A759F]/40 hover:border-[#1A759F] text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                                title="Personalizar preço e desconto manualmente"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span className="hidden xl:inline">Personalizar</span>
                              </button>

                              {/* Botão Rejeitar (se houver sugestão pendente) */}
                              {p.sugestaoIA && p.sugestaoIA.status === 'PENDING' && (
                                <button
                                  type="button"
                                  onClick={() => onRejectAi(p.id)}
                                  className="h-8 w-8 flex items-center justify-center text-[#B91C1C] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                                  title="Rejeitar sugestão da IA"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}

                              {/* Dropdown de Destino Operacional */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveDropdownId(activeDropdownId === p.id ? null : p.id)
                                  }
                                  className="h-8 px-2 flex items-center gap-1 text-[#475569] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-xs font-medium"
                                  title="Menu de destino do produto"
                                >
                                  <span className="hidden sm:inline">Destino</span>
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                </button>

                                {activeDropdownId === p.id && (
                                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-popover py-1 z-30 text-left">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onOpenDestination(p, 'venda_normal');
                                        setActiveDropdownId(null);
                                      }}
                                      className="w-full px-3 py-1.5 text-xs text-[#184E77] hover:bg-[#F8FAFC] flex items-center justify-between"
                                    >
                                      Venda Normal
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onOpenDestination(p, 'venda_promocional');
                                        setActiveDropdownId(null);
                                      }}
                                      className="w-full px-3 py-1.5 text-xs text-[#184E77] hover:bg-[#F8FAFC] flex items-center justify-between"
                                    >
                                      Venda Promocional
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onOpenDestination(p, 'self_service_transfer');
                                        setActiveDropdownId(null);
                                      }}
                                      className="w-full px-3 py-1.5 text-xs text-[#184E77] hover:bg-[#F8FAFC] flex items-center justify-between"
                                    >
                                      Enviar ao Self-Service
                                    </button>
                                    <hr className="my-1 border-[#F1F5F9]" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onOpenDestination(p, 'descarte');
                                        setActiveDropdownId(null);
                                      }}
                                      className="w-full px-3 py-1.5 text-xs text-[#B91C1C] hover:bg-[#FEE2E2] flex items-center justify-between font-semibold"
                                    >
                                      Descartar
                                    </button>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
