import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from './Toast';

export default function AppShell({
  activeTab,
  onTabChange,
  categoryFilter,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onOpenLotModal,
  toasts,
  onDismissToast,
  children,
}) {
  // Controla o drawer mobile (overlay deslizante)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Controla sidebar colapsada (só ícones) em tablets
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Fecha o drawer mobile ao trocar de aba
  const handleTabChange = (tab) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  // Fecha o drawer ao pressionar Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Impede scroll do body quando o drawer mobile está aberto
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-row font-sans text-[#184E77] antialiased">

      {/* ── Overlay escuro para fechar o drawer mobile ── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          aria-hidden="true"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── 1. Sidebar ── */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)}
      />

      {/* ── 2. Coluna Principal ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          categoryFilter={categoryFilter}
          onCategoryChange={onCategoryChange}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onOpenLotModal={onOpenLotModal}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Conteúdo rolável */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto pb-24 lg:pb-6">
          {children}
        </main>
      </div>

      {/* ── 3. Bottom Navigation — apenas mobile ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E2E8F0] flex items-center justify-around lg:hidden z-30 shadow-[0_-2px_8px_rgba(24,78,119,0.07)]"
        aria-label="Navegação inferior"
      >
        {[
          { id: 'dashboard',  label: 'Dashboard',  emoji: '📊' },
          { id: 'inventory',  label: 'Validades',   emoji: '📦' },
          { id: 'movements',  label: 'Histórico',   emoji: '📋' },
          { id: 'offers',     label: 'Vitrine',     emoji: '🏪' },
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[60px] ${
                isActive
                  ? 'text-[#168AAD]'
                  : 'text-[#94A3B8] hover:text-[#475569]'
              }`}
            >
              <span className="text-lg leading-none">{item.emoji}</span>
              <span className={`text-[10px] font-semibold ${isActive ? 'text-[#168AAD]' : 'text-[#94A3B8]'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-4 h-0.5 rounded-full bg-[#168AAD] mt-0.5" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── 4. Toasts ── */}
      <Toast toasts={toasts} onDismiss={onDismissToast} />
    </div>
  );
}
