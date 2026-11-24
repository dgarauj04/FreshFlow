import React from 'react';
import { LayoutDashboard, ClipboardList, History, Store, Leaf, ChevronLeft, ChevronRight, X, CircleUserRound } from 'lucide-react';
import logoFreshFlow from "../../assets/freshflow-logo.png";

export default function Sidebar({
  activeTab,
  onTabChange,
  isMobileMenuOpen,
  onCloseMobileMenu,
  isCollapsed,
  onToggleCollapse,
}) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'inventory',
      label: 'Gestão de Validades & Lotes',
      icon: ClipboardList,
    },
    {
      id: 'movements',
      label: 'Histórico de Movimentações',
      icon: History,
    },
    {
      id: 'offers',
      label: 'Vitrine "Última Hora"',
      icon: Store,
    },
  ];

  return (
    <>
      {/*
       * ── SIDEBAR DESKTOP / TABLET ──
       * Visível a partir de lg (1024px).
       * Em tablets (md → lg) encolhe para modo slim (apenas ícones).
       */}
      <aside
        className={`
          hidden lg:flex flex-col justify-between flex-shrink-0 h-screen sticky top-0
          bg-[#1E6091] text-white border-r border-[#164E77]/20 select-none z-30
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-64'}
        `}
        aria-label="Navegação Lateral"
      >
        {/* Topo: Logo */}
        <div>
          <div
            className={`h-16 flex items-center border-b border-white/10 transition-all duration-300 ${
              isCollapsed ? 'justify-center px-0' : 'px-5 gap-3'
            }`}
          >
            {/* Ícone/Logo sempre visível */}
            <div className="w-14 h-14 rounded-xl  flex items-center justify-center flex-shrink-0">
              <img src={logoFreshFlow} alt="FreshFlow Logo"  />
            </div>

            {/* Texto só na versão expandida */}
            {!isCollapsed && (
              <div className="overflow-hidden">
                <span className="text-xl font-bold tracking-tight text-white block leading-tight">
                  FreshFlow
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#D9ED92] font-semibold leading-none">
                  Controle Inteligente
                </span>
              </div>
            )}
          </div>

          {/* Navegação Principal */}
          <nav
            className={`p-2 space-y-1 mt-3 ${isCollapsed ? 'px-2' : 'px-3'}`}
            aria-label="Menu principal"
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center gap-3 py-3 rounded-lg text-sm font-medium
                    transition-all relative group text-left
                    ${isCollapsed ? 'justify-center px-0' : 'px-3.5'}
                    ${
                      isActive
                        ? 'bg-white/15 text-white font-semibold shadow-sm'
                        : 'text-[#E2F0F7] hover:bg-white/10 hover:text-white'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Indicador de aba ativa */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#D9ED92] rounded-r-md" />
                  )}

                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      isActive ? 'text-[#D9ED92]' : 'text-[#E2F0F7] group-hover:text-white'
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.75}
                  />

                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}

                  {/* Tooltip no modo colapsado */}
                  {isCollapsed && (
                    <span className="
                      absolute left-full ml-3 px-2.5 py-1.5 bg-[#184E77] text-white text-xs
                      rounded-lg shadow-lg whitespace-nowrap pointer-events-none
                      opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0
                      transition-all duration-150 z-50
                    ">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Rodapé */}
        <div>
          {/* Rodapé da gerente */}
          <div className={`p-4 bg-[#184E77] border-t border-white/10 ${isCollapsed ? 'flex justify-center' : ''}`}>
            {isCollapsed ? (
              /* Avatar compacto */
              <div
                className="w-9 h-9 rounded-full bg-[#52B69A] text-white flex items-center justify-center font-bold text-xs shadow-inner flex-shrink-0"
                title="Célia — Gerente de Setor"
              >
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#52B69A] text-white flex items-center justify-center font-bold text-sm shadow-inner flex-shrink-0">
                    <CircleUserRound size={24} />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-semibold text-white leading-tight truncate">
                      Célia
                    </h4>
                    <p className="text-xs text-[#E2F0F7]/70 leading-tight">
                      Gerente de Setor
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/10 text-xs text-[#E2F0F7]">
                  <span className="w-2 h-2 rounded-full bg-[#99D98C] animate-pulse flex-shrink-0" />
                  <span className="truncate font-medium">Loja Piloto 01 · Operando</span>
                </div>
              </>
            )}
          </div>

          {/* Botão colapsar/expandir */}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
            className="w-full flex items-center justify-center py-2.5 text-[#E2F0F7]/60 hover:text-white hover:bg-white/10 transition-colors text-xs gap-1.5 border-t border-white/10"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Recolher</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/*
       * ── DRAWER MOBILE ──
       * Desliza da esquerda em telas < lg (1024px).
       * Controlado pelo estado isMobileMenuOpen do AppShell.
       */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 max-w-[85vw]
          bg-[#1E6091] text-white flex flex-col justify-between
          border-r border-[#164E77]/20 select-none z-50
          transition-transform duration-300 ease-in-out
          lg:hidden
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Menu móvel"
        aria-modal="true"
        role="dialog"
      >
        {/* Topo mobile */}
        <div>
          <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
            <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl  flex items-center justify-center flex-shrink-0">
                  <img src={logoFreshFlow} alt="FreshFlow Logo"  />
                </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white block leading-tight">
                  FreshFlow
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#D9ED92] font-semibold leading-none">
                  Controle Inteligente
                </span>
              </div>
            </div>

            {/* Fechar drawer */}
            <button
              type="button"
              onClick={onCloseMobileMenu}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Itens de navegação mobile */}
          <nav className="p-3 space-y-1 mt-3" aria-label="Menu principal móvel">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-3.5 rounded-lg text-sm font-medium
                    transition-all relative text-left
                    ${
                      isActive
                        ? 'bg-white/15 text-white font-semibold shadow-sm'
                        : 'text-[#E2F0F7] hover:bg-white/10 hover:text-white'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#D9ED92] rounded-r-md" />
                  )}
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? 'text-[#D9ED92]' : 'text-[#E2F0F7]'
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.75}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Rodapé mobile */}
        <div className="p-4 bg-[#184E77] border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#52B69A] text-white flex items-center justify-center font-bold text-sm shadow-inner flex-shrink-0">
              <CircleUserRound size={24} />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-white leading-tight truncate">Célia</h4>
              <p className="text-xs text-[#E2F0F7]/70 leading-tight">Gerente de Setor</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/10 text-xs text-[#E2F0F7]">
            <span className="w-2 h-2 rounded-full bg-[#99D98C] animate-pulse flex-shrink-0" />
            <span className="truncate font-medium">Loja Piloto 01 · Operando</span>
          </div>
        </div>
      </aside>
    </>
  );
}
