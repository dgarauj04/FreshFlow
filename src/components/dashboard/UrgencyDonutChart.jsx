import React from 'react';

export default function UrgencyDonutChart({ distribuicao }) {
  const data = [
    { label: 'Vencido', count: distribuicao.vencido || 3, color: '#B91C1C', bg: '#FEE2E2' },
    { label: 'Vence Hoje / Amanhã', count: distribuicao.hojeAmanha || 9, color: '#C2410C', bg: '#FFEDD5' },
    { label: 'Próximo (até 2 dias)', count: distribuicao.proximo || 12, color: '#B45309', bg: '#FEF3C7' },
    { label: 'Monitoramento (até 5 dias)', count: distribuicao.monitoramento || 17, color: '#168AAD', bg: '#E0F2FE' },
    { label: 'No Prazo', count: distribuicao.noPrazo || 23, color: '#76C893', bg: '#DCFCE7' },
  ];

  const total = data.reduce((acc, curr) => acc + curr.count, 0) || 64;

  // Cálculo dos arcos SVG do gráfico de rosca
  let accumulatedAngle = 0;
  const radius = 54;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-card flex flex-col justify-between">
      <h3 className="text-base font-semibold text-[#184E77] pb-3 border-b border-[#F1F5F9]">
        Distribuição por urgência
      </h3>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 my-auto py-2">
        {/* Rosca SVG */}
        <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
            {data.map((item, idx) => {
              const sliceRatio = item.count / total;
              const strokeDasharray = `${sliceRatio * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedAngle * circumference;
              accumulatedAngle += sliceRatio;

              return (
                <circle
                  key={idx}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700 ease-out"
                />
              );
            })}
          </svg>

          {/* Rótulo Central */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-[#184E77] tabular-nums leading-none">
              {total}
            </span>
            <span className="text-[11px] text-[#94A3B8] font-medium mt-0.5">
              lotes
            </span>
          </div>
        </div>

        {/* Legenda com contadores */}
        <div className="space-y-1.5 text-xs text-[#475569] w-full max-w-[210px]">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 py-0.5">
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-[#184E77]">{item.label}</span>
              </div>
              <span className="font-bold text-[#184E77] tabular-nums flex-shrink-0">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
