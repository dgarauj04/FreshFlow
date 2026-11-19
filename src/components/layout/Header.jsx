import React, { useState } from 'react';
import { Search, Plus, Menu, X, ChevronDown } from 'lucide-react';

export default function Header({
  activeTab,
  categoryFilter,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onOpenLotModal,
  onOpenMobileMenu,
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const tabTitles = {
    dashboard: 'Dashboard',
    inventory: 'Gestão de Validades & Lotes',
    movements: 'Histórico de Movimentações',
    offers: 'Vitrine "Última Hora"',
  };

  const categories = [
    { id: 'Todas',              label: 'Todas'            },
    { id: 'Padaria',            label: 'Padaria'          },
    { id: 'Frios e Laticínios', label: 'Frios e Laticínios' },
    { id: 'Hortifrúti',        label: 'Hortifrúti'       },
  ];

  const activeCategoryLabel = categories.find((c) => c.id === categoryFilter)?.label ?? 'Todas';

  return (
    <header
      className="bg-white border-b border-[#E2E8F0] sticky top-0 z-20 shadow-[0_1px_2px_rgba(24,78,119,0.04)]"
      role="banner"
    >
      {/* ── Linha principal ── */}
      <div className="h-14 md:h-16 px-4 md:px-6 flex items-center justify-between gap-3">

        {/* ESQUERDA: Hambúrguer (mobile) + Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Botão hambúrguer — apenas mobile */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#475569] hover:bg-[#F1F5F9] transition-colors flex-shrink-0"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm min-w-0">
            <span className="text-[#94A3B8] font-medium hidden sm:inline whitespace-nowrap">
              FreshFlow
            </span>
            <span className="text-[#CBD5E1] hidden sm:inline">/</span>
            <span className="text-[#184E77] font-semibold truncate">
              {tabTitles[activeTab] || 'Painel'}
            </span>
          </nav>
        </div>

        {/* CENTRO: Busca (desktop) + Filtro de categoria (desktop) */}
        <div className="hidden md:flex items-center gap-3 flex-1 justify-center max-w-2xl">
          {/* Campo de busca */}
          <div className="relative w-64 lg:w-80">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar produto ou lote..."
              className="w-full h-9 pl-9 pr-3 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#184E77] placeholder-[#94A3B8] focus:outline-none focus:border-[#1A759F] focus:ring-2 focus:ring-[#1A759F]/20 transition-all"
              aria-label="Buscar produto ou lote"
            />
          </div>

          {/* Segmented control de categorias */}
          <div
            className="hidden lg:inline-flex p-1 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] text-xs font-medium flex-shrink-0"
            role="group"
            aria-label="Filtro de Categoria"
          >
            {categories.map((cat) => {
              const isActive = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategoryChange(cat.id)}
                  className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#168AAD] text-white shadow-xs font-semibold'
                      : 'text-[#475569] hover:text-[#184E77] hover:bg-white/60'
                  }`}
                  aria-pressed={isActive}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Dropdown de categoria para tablet (md → lg) */}
          <div className="relative lg:hidden flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsCategoryOpen((v) => !v)}
              className="h-9 px-3 flex items-center gap-1.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#184E77] hover:bg-[#E2E8F0] transition-colors whitespace-nowrap"
            >
              {activeCategoryLabel}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCategoryOpen && (
              <div className="absolute top-full mt-1 right-0 w-44 bg-white border border-[#E2E8F0] rounded-xl shadow-lg py-1 z-30">
                {categories.map((cat) => {
                  const isActive = categoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => { onCategoryChange(cat.id); setIsCategoryOpen(false); }}
                      className={`w-full px-3 py-2 text-xs text-left transition-colors ${
                        isActive
                          ? 'text-[#168AAD] font-semibold bg-[#E0F2FE]'
                          : 'text-[#475569] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* DIREITA: Ícone de busca mobile + botão cadastrar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Busca mobile — toggle */}
          <button
            type="button"
            onClick={() => setIsSearchOpen((v) => !v)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#475569] hover:bg-[#F1F5F9] transition-colors"
            aria-label={isSearchOpen ? 'Fechar busca' : 'Abrir busca'}
          >
            {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>

          {/* Botão Cadastrar */}
          <button
            type="button"
            onClick={onOpenLotModal}
            className="h-9 px-3 md:px-4 bg-[#34A0A4] hover:bg-[#2e8f93] text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors focus:ring-2 focus:ring-[#34A0A4]/30 focus:outline-none active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Cadastrar Lote</span>
          </button>
        </div>
      </div>

      {/* ── Barra de busca expandida (mobile) ── */}
      {isSearchOpen && (
        <div className="md:hidden px-4 pb-3 border-t border-[#F1F5F9] pt-3 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar produto, marca ou lote..."
              autoFocus
              className="w-full h-10 pl-9 pr-3 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#184E77] placeholder-[#94A3B8] focus:outline-none focus:border-[#1A759F] focus:ring-2 focus:ring-[#1A759F]/20 transition-all"
              aria-label="Buscar produto ou lote"
            />
          </div>

          {/* Categorias como chips horizontais no mobile */}
          <div
            className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none"
            role="group"
            aria-label="Filtro de categoria"
          >
            {categories.map((cat) => {
              const isActive = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategoryChange(cat.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#168AAD] text-white shadow-xs'
                      : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                  }`}
                  aria-pressed={isActive}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
