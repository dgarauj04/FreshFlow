import React from 'react';
import AppShell from './components/layout/AppShell';
import DashboardView from './components/dashboard/DashboardView';
import InventoryTable from './components/inventory/InventoryTable';
import MovementsTable from './components/movements/MovementsTable';
import VitrineGrid from './components/offers/VitrineGrid';
import LotModal from './components/inventory/LotModal';
import DestinationModal from './components/inventory/DestinationModal';
import CustomPriceModal from './components/ai-suggestions/CustomPriceModal';
import { useInventory } from './hooks/useInventory';

export default function App() {
  const {
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
  } = useInventory();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-[#184E77]">
        <div className="w-12 h-12 border-4 border-[#34A0A4] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold">Carregando FreshFlow...</h2>
        <p className="text-xs text-[#64748B] mt-1">Sincronizando lotes e indicadores da Loja Piloto 01</p>
      </div>
    );
  }

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      categoryFilter={categoryFilter}
      onCategoryChange={setCategoryFilter}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onOpenLotModal={() => setIsLotModalOpen(true)}
      toasts={toasts}
      onDismissToast={removeToast}
    >
      {/* 1. Tela 1: Dashboard */}
      {activeTab === 'dashboard' && (
        <DashboardView
          kpis={kpis}
          products={filteredProducts}
          onNavigateToTab={setActiveTab}
          onApplyUrgencyFilter={(urgency) => {
            setUrgencyFilter(urgency);
            setActiveTab('inventory');
          }}
          activeUrgencyFilter={urgencyFilter}
          onAcceptAi={acceptAiSuggestion}
          onOpenDestination={(product, defaultAction) =>
            setDestinationModalItem({ product, defaultAction })
          }
        />
      )}

      {/* 2. Tela 2: Gestão de Validades & Lotes */}
      {activeTab === 'inventory' && (
        <InventoryTable
          products={filteredProducts}
          allProductsForCount={productsForUrgencyCount}
          urgencyFilter={urgencyFilter}
          onUrgencyFilterChange={setUrgencyFilter}
          onAcceptAi={acceptAiSuggestion}
          onRejectAi={rejectAiSuggestion}
          onOpenCustomPrice={(product) => setCustomPriceModalItem(product)}
          onOpenDestination={(product, defaultAction) =>
            setDestinationModalItem({ product, defaultAction })
          }
          onRunAiSimulation={runAiSimulation}
          onRestoreFefo={() => {
            setUrgencyFilter('Todos');
            setSearchQuery('');
          }}
          aiSimulationLoading={aiSimulationLoading}
        />
      )}

      {/* 3. Tela 3: Histórico de Movimentações */}
      {activeTab === 'movements' && (
        <MovementsTable movements={movements} />
      )}

      {/* 4. Tela 4: Vitrine "Última Hora" (Simulação Interna) */}
      {activeTab === 'offers' && (
        <VitrineGrid products={products} />
      )}

      {/* MODAL GLOBAL: Cadastrar Novo Lote */}
      <LotModal
        isOpen={isLotModalOpen}
        onClose={() => setIsLotModalOpen(false)}
        onSubmit={createNewLot}
        currentCategoryFilter={categoryFilter}
      />

      {/* MODAL: Destino Operacional */}
      {destinationModalItem && (
        <DestinationModal
          product={destinationModalItem.product}
          defaultAction={destinationModalItem.defaultAction}
          onClose={() => setDestinationModalItem(null)}
          onConfirm={registerDestination}
        />
      )}

      {/* MODAL: Personalizar Preço */}
      {customPriceModalItem && (
        <CustomPriceModal
          product={customPriceModalItem}
          onClose={() => setCustomPriceModalItem(null)}
          onConfirm={customizePrice}
        />
      )}
    </AppShell>
  );
}
