import React from 'react';

export default function StockBar({ available, total }) {
  const disp = Math.max(0, available || 0);
  const tot = Math.max(1, total || disp);
  const percent = Math.min(100, Math.round((disp / tot) * 100));

  let barColor = 'bg-[#76C893]'; // Verde padrão
  if (percent <= 25) {
    barColor = 'bg-[#C2410C]'; // Alerta crítico
  } else if (percent <= 50) {
    barColor = 'bg-[#B45309]'; // Atenção
  }

  return (
    <div className="w-24">
      <div className="flex items-center justify-between text-xs tabular-nums mb-1">
        <span className="font-semibold text-[#184E77]">{disp}</span>
        <span className="text-[#94A3B8]">/ {tot}</span>
      </div>
      <div className="w-full h-1 bg-[#E2E8F0] rounded-full overflow-hidden">
        <div
          style={{ width: `${percent}%` }}
          className={`h-full ${barColor} rounded-full transition-all duration-300`}
        />
      </div>
    </div>
  );
}
