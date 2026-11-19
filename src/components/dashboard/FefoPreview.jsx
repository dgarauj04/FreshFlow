import React from 'react';
import { Check, Trash2, ArrowRight } from 'lucide-react';
import { getUrgencyMetadata, calculateDaysRemaining } from '../../utils/rules';
import { formatCurrency, formatRelativeDays } from '../../utils/formatters';

export default function FefoPreview({
  products,
  onNavigateToInventory,
  onAcceptAi,
  onOpenDestination,
}) {
  // Pega os 5 primeiros produtos pela ordem FEFO
  const top5 = products.slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
      {/* Cabeçalho */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-base font-semibold text-[#184E77]">
            Prévia FEFO — 5 lotes mais urgentes
          </h3>
          <p className="text-xs text-[#94A3B8]">Primeiro que vence, primeiro que sai</p>
        </div>

        <button
          type="button"
          onClick={onNavigateToInventory}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#168AAD] hover:text-[#184E77] transition-colors"
        >
          <span>Ver todos os lotes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Lista de 5 Lotes */}
      <div className="divide-y divide-[#F1F5F9]">
        {top5.map((p) => {
          const days = calculateDaysRemaining(p.dataValidade);
          const meta = getUrgencyMetadata(days);
          const disp = (p.quantidadeEmExposicao || 0) + (p.quantidadeNoSelfService || 0);
          const total = p.quantidadeInicial || disp;

          return (
            <div
              key={p.id}
              className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                meta.isBlocked ? 'bg-[#FEF2F2]/60' : 'hover:bg-[#F8FAFC]'
              }`}
            >
              {/* Status e Identificação */}
              <div className="flex items-center gap-3 min-w-[280px]">
                {/* Indicador de barra de status */}
                <span className={`w-1 h-9 rounded-full ${meta.borderBar}`} />

                {/* Badge de status */}
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${meta.badgeBg} ${meta.badgeText} border ${meta.badgeBorder}`}
                >
                  {meta.label}
                </span>

                <div>
                  <h4 className="text-sm font-semibold text-[#184E77] leading-tight">
                    {p.nome}
                  </h4>
                  <p className="text-xs text-[#94A3B8] leading-tight">
                    {p.marca} · {p.categoria}
                  </p>
                </div>
              </div>

              {/* Lote e Data */}
              <div className="flex items-center gap-6 text-xs text-[#64748B]">
                <span className="font-mono text-[#184E77] font-medium bg-[#F1F5F9] px-2 py-0.5 rounded">
                  {p.lote}
                </span>

                <div className="text-left">
                  <span className={`block font-medium ${meta.badgeText}`}>
                    {formatRelativeDays(days)}
                  </span>
                </div>

                {/* Estoque */}
                <div className="tabular-nums">
                  <span className="font-bold text-[#184E77]">{disp}</span>
                  <span className="text-[#94A3B8]"> / {total}</span>
                </div>
              </div>

              {/* Ação Rápida */}
              <div className="flex items-center justify-end">
                {meta.isBlocked ? (
                  <button
                    type="button"
                    onClick={() => onOpenDestination(p, 'descarte')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] transition-colors border border-transparent hover:border-[#FCA5A5]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Descartar
                  </button>
                ) : p.sugestaoIA && p.sugestaoIA.status === 'PENDING' ? (
                  <button
                    type="button"
                    onClick={() => onAcceptAi(p.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#76C893] hover:bg-[#68b884] text-[#184E77] transition-all shadow-xs active:scale-[0.98]"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    Aceitar IA · {formatCurrency(p.sugestaoIA.precoSugerido)}
                  </button>
                ) : p.sugestaoIA && p.sugestaoIA.status === 'APPROVED' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#166534] bg-[#DCFCE7] px-2.5 py-1 rounded-md">
                    ✓ Em oferta ({formatCurrency(p.precoAtual)})
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onNavigateToInventory}
                    className="text-xs font-medium text-[#168AAD] hover:underline"
                  >
                    Ver detalhes
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
