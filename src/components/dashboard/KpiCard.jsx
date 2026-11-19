import React from 'react';
import { Package, Clock, Sparkles, Leaf } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function KpiCard({
  type,
  kpis,
  onNavigateToTab,
  onApplyUrgencyFilter,
  activeUrgencyFilter,
}) {
  if (type === 'desperdicio') {
    return (
      <div
        className="bg-[#34A0A4] text-white p-5 rounded-xl shadow-card relative overflow-hidden flex flex-col justify-between min-h-[168px] transition-all hover:shadow-md cursor-pointer border border-[#34A0A4]/80"
        onClick={() => onNavigateToTab('inventory')}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-[#D9ED92]" />
              Desperdício Evitado (R$ / Semana)
            </span>
          </div>

          <div className="mt-2 text-3xl font-bold tracking-tight text-white tabular-nums">
            {formatCurrency(kpis.desperdicioEvitadoValor || 2847.60)}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D9ED92] text-[#184E77]">
            ▲ 12% vs. semana anterior
          </span>

          {/* Sparkline mini-gráfico vetorial */}
          <svg className="w-24 h-7 stroke-white fill-none stroke-[2] opacity-80" viewBox="0 0 100 30">
            <path d="M 0,25 Q 20,28 35,18 T 70,12 T 100,4" />
          </svg>
        </div>
      </div>
    );
  }

  if (type === 'recuperados') {
    return (
      <div
        className="bg-white p-5 rounded-xl shadow-card border border-[#E2E8F0] flex flex-col justify-between min-h-[168px] hover:shadow-md transition-all cursor-pointer"
        onClick={() => onNavigateToTab('movements')}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
              Alimentos Recuperados (Unidades)
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#166534]">
              <Package className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2 text-3xl font-bold tracking-tight text-[#184E77] tabular-nums">
            {kpis.alimentosRecuperadosQtd || 412} un.
          </div>

          <p className="mt-1 text-xs font-medium text-[#168AAD]">
            {formatCurrency(kpis.desperdicioEvitadoValor || 2847.60)} em valor comercial recuperado
          </p>
        </div>

        <p className="text-[11px] text-[#94A3B8] border-t border-[#F1F5F9] pt-2 mt-2 leading-tight">
          Vendas com desconto, normais e self-service. Descartes não entram.
        </p>
      </div>
    );
  }

  if (type === 'criticos') {
    const isFiltered = activeUrgencyFilter === 'Vence Hoje/Amanhã';

    return (
      <div
        className={`bg-white p-5 rounded-xl shadow-card border flex flex-col justify-between min-h-[168px] hover:shadow-md transition-all cursor-pointer ${
          isFiltered ? 'border-[#C2410C] ring-2 ring-[#C2410C]/20' : 'border-[#E2E8F0]'
        }`}
        onClick={() => {
          onApplyUrgencyFilter(isFiltered ? 'Todos' : 'Vence Hoje/Amanhã');
          onNavigateToTab('inventory');
        }}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
              Atenção Crítica (Vence Hoje / Amanhã)
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FFEDD5] flex items-center justify-center text-[#C2410C]">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2 text-3xl font-bold tracking-tight text-[#184E77] tabular-nums">
            {kpis.atencaoCriticaLotes} lotes
          </div>

          <div className="mt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFEDD5] text-[#C2410C] border border-[#FDBA74]">
              ⏱ Ação necessária hoje
            </span>
          </div>
        </div>

        <p className="text-xs text-[#94A3B8] border-t border-[#F1F5F9] pt-2 mt-2">
          {kpis.venceHojeCount} vencem hoje · {kpis.venceAmanhaCount} vencem amanhã
        </p>
      </div>
    );
  }

  if (type === 'ia') {
    return (
      <div
        className="bg-white p-5 rounded-xl shadow-card border border-[#E2E8F0] flex flex-col justify-between min-h-[168px] hover:shadow-md transition-all cursor-pointer"
        onClick={() => onNavigateToTab('inventory')}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
              Sugestões de IA Pendentes
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#E0F2FE] flex items-center justify-center text-[#34A0A4]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#34A0A4] text-white font-bold flex items-center justify-center text-lg tabular-nums shadow-xs">
              {kpis.sugestoesIaPendentes}
            </div>
            <div>
              <h5 className="text-sm font-semibold text-[#184E77] leading-tight">
                Aguardando sua decisão
              </h5>
              <span className="text-xs text-[#168AAD] hover:underline font-medium block">
                Revisar sugestões →
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#475569] border-t border-[#F1F5F9] pt-2 mt-2">
          Economia potencial estimada: <strong className="text-[#34A0A4]">{formatCurrency(kpis.potencialIaEconomia || 412.30)}</strong>
        </p>
      </div>
    );
  }

  return null;
}
