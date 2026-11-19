import React from 'react';
import { Download } from 'lucide-react';
import KpiCard from './KpiCard';
import WasteBarChart from './WasteBarChart';
import UrgencyDonutChart from './UrgencyDonutChart';
import FefoPreview from './FefoPreview';
import RecoverySummary from './RecoverySummary';

export default function DashboardView({
  kpis,
  products,
  onNavigateToTab,
  onApplyUrgencyFilter,
  activeUrgencyFilter,
  onAcceptAi,
  onOpenDestination,
}) {
  const handleExportWeek = () => {
    alert('Relatório gerencial consolidado da semana baixado com sucesso (Loja Piloto 01).');
  };

  return (
    <div className="space-y-6" aria-label="Painel Gerencial">
      {/* 1. Header do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#184E77]">
            Bom dia, Dona Célia
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Loja Piloto 01 — terça-feira, 17/11/2026 — Semana de 11/11/2026 a 17/11/2026
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportWeek}
          className="px-3.5 py-2 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#184E77] text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#168AAD]" />
          Exportar semana
        </button>
      </div>

      {/* 2. Grid de 4 KPI Cards Fiel à Imagem 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          type="desperdicio"
          kpis={kpis}
          onNavigateToTab={onNavigateToTab}
        />
        <KpiCard
          type="recuperados"
          kpis={kpis}
          onNavigateToTab={onNavigateToTab}
        />
        <KpiCard
          type="criticos"
          kpis={kpis}
          onNavigateToTab={onNavigateToTab}
          onApplyUrgencyFilter={onApplyUrgencyFilter}
          activeUrgencyFilter={activeUrgencyFilter}
        />
        <KpiCard
          type="ia"
          kpis={kpis}
          onNavigateToTab={onNavigateToTab}
        />
      </div>

      {/* 3. Linha de Gráficos (2/3 Barras e 1/3 Rosca) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <WasteBarChart />
        </div>
        <div className="lg:col-span-1">
          <UrgencyDonutChart distribuicao={kpis.distribuicaoUrgencia} />
        </div>
      </div>

      {/* 4. Prévia FEFO dos 5 lotes mais urgentes */}
      <FefoPreview
        products={products}
        onNavigateToInventory={() => onNavigateToTab('inventory')}
        onAcceptAi={onAcceptAi}
        onOpenDestination={onOpenDestination}
      />

      {/* 5. Comparativo Recuperados vs. Descartados e Taxa de Aproveitamento (91%) */}
      <RecoverySummary kpis={kpis} />
    </div>
  );
}
