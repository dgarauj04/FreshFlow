import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export default function RecoverySummary({ kpis }) {
  const taxa = kpis.taxaAproveitamento || 91;
  const valRecuperado = kpis.desperdicioEvitadoValor || 2847.60;
  const qtdRecuperada = kpis.alimentosRecuperadosQtd || 412;
  const valDescartado = kpis.descartadosValor || 281.40;
  const qtdDescartada = kpis.descartadosQtd || 23;

  return (
    <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-base font-semibold text-[#184E77]">
            Recuperados vs. Descartados
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Semana de 11/11/2026 a 17/11/2026
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-[#94A3B8] block">Taxa de aproveitamento</span>
          <span className="text-2xl font-bold text-[#184E77] tabular-nums">
            {taxa}%
          </span>
        </div>
      </div>

      {/* Barra de Progresso Empilhada */}
      <div className="w-full h-3.5 bg-[#FEE2E2] rounded-full overflow-hidden flex shadow-inner">
        <div
          style={{ width: `${taxa}%` }}
          className="h-full bg-gradient-to-r from-[#52B69A] to-[#76C893] transition-all duration-700 rounded-l-full"
          role="progressbar"
          aria-valuenow={taxa}
          aria-valuemin="0"
          aria-valuemax="100"
        />
        <div
          style={{ width: `${100 - taxa}%` }}
          className="h-full bg-[#FCA5A5] transition-all duration-700 rounded-r-full"
        />
      </div>

      {/* Legenda dos Valores */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-[#76C893] inline-block" />
          <span className="text-[#184E77] font-semibold tabular-nums">
            {formatCurrency(valRecuperado)} recuperados
          </span>
          <span className="text-[#64748B] tabular-nums">— {qtdRecuperada} un.</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-[#FCA5A5] inline-block" />
          <span className="text-[#B91C1C] font-semibold tabular-nums">
            {formatCurrency(valDescartado)} descartados
          </span>
          <span className="text-[#64748B] tabular-nums">— {qtdDescartada} un.</span>
        </div>
      </div>
    </div>
  );
}
