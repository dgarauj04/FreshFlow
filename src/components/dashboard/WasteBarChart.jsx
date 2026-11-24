import React from 'react';
import { DAILY_WASTE_DATA } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

export default function WasteBarChart() {
  const maxVal = 600;
  const gridTicks = [500, 400, 300, 200, 100, 0];

  return (
    <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-card flex flex-col justify-between">
      {/* Header do Gráfico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-base font-semibold text-[#184E77]">Desperdício evitado por dia</h3>
          <p className="text-xs text-[#94A3B8]">Últimos 7 dias · 11/11 a 17/11/2026</p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-[#94A3B8] uppercase tracking-wider block">Total semanal</span>
          <span className="text-lg font-bold text-[#184E77] tabular-nums">R$ 2.847,60</span>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 py-3 text-xs text-[#475569]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-[#52B69A]" />
          <span>Recuperado (R$)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-[#FCA5A5]" />
          <span>Descartado (R$)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-[#168AAD]" />
          <span className="font-medium text-[#184E77]">Hoje</span>
        </div>
      </div>

      {/* Área do Gráfico de Barras com Grid Lines */}
      <div className="relative pt-4 pb-2">
        {/* Linhas de grade horizontais */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 pr-2">
          {gridTicks.map((tick) => (
            <div key={tick} className="flex items-center w-full">
              <span className="text-[10px] text-[#94A3B8] w-7 text-right tabular-nums pr-2 select-none">
                {tick}
              </span>
              <div className="w-full border-b border-[#F1F5F9]" />
            </div>
          ))}
        </div>

        {/* Colunas de barras */}
        <div className="relative z-10 flex items-end justify-between pl-9 pr-2 h-48 gap-2 pt-2 overflow-x-auto md:overflow-visible">
          {DAILY_WASTE_DATA.map((item, idx) => {
            const recHeightPercent = Math.min(100, (item.recuperado / maxVal) * 100);
            const descHeightPercent = Math.min(100, (item.descartado / maxVal) * 100);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip ao passar o mouse */}
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-[#184E77] text-white text-[11px] rounded-lg py-1 px-2 pointer-events-none shadow-md whitespace-nowrap z-20 -top-[0.6rem] md:-top-12">
                  <span className="font-semibold block">{item.dia}</span>
                  <span>Recuperado: {formatCurrency(item.recuperado)}</span>
                  <span className="block text-[#FCA5A5]">Descarte: {formatCurrency(item.descartado)}</span>
                </div>

                {/* Valor no topo da barra */}
                <span className="text-[10px] text-[#64748B] font-medium tabular-nums mb-1 opacity-90 group-hover:text-[#184E77]">
                  {formatCurrency(item.recuperado)}
                </span>

                {/* Barras Lado a Lado / Empilhadas */}
                <div className="w-full max-w-[28px] flex items-end justify-center gap-1 h-full">
                  {/* Barra de Recuperado */}
                  <div
                    style={{ height: `${recHeightPercent}%` }}
                    className={`w-full rounded-t-sm transition-all duration-500 ${
                      item.isToday
                        ? 'bg-[#168AAD] group-hover:bg-[#1A759F]'
                        : 'bg-[#52B69A] group-hover:bg-[#34A0A4]'
                    }`}
                  />
                  {/* Barra de Descartado */}
                  <div
                    style={{ height: `${descHeightPercent}%` }}
                    className="w-6 rounded-t-sm bg-[#FCA5A5] group-hover:bg-[#F87171] transition-all duration-500"
                  />
                </div>

                {/* Rótulo do Dia */}
                <span className={`text-[11px] mt-2 select-none ${
                  item.isToday ? 'font-bold text-[#168AAD]' : 'text-[#64748B]'
                }`}>
                  {item.dia}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
