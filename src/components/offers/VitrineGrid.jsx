import React, { useState } from 'react';
import { Eye, Clock, Sparkles, Tag, ShieldAlert } from 'lucide-react';
import { calculateDaysRemaining } from '../../utils/rules';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function VitrineGrid({ products }) {
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Filtra apenas produtos elegíveis para a vitrine:
  // 1. Não vencidos (dias >= 0)
  // 2. Com estoque disponível (> 0)
  // 3. Com preço promocional aprovado ou desconto ativo (> 0 e precoAtual < precoOriginal)
  const validOffers = products.filter((p) => {
    const days = calculateDaysRemaining(p.dataValidade);
    const available = (p.quantidadeEmExposicao || 0) + (p.quantidadeNoSelfService || 0);
    const hasPromoPrice = p.descontoPercentual > 0 && p.precoAtual < p.precoOriginal;
    const isApproved = p.sugestaoIA ? p.sugestaoIA.status === 'APPROVED' : hasPromoPrice;
    return days >= 0 && available > 0 && (hasPromoPrice || isApproved);
  });

  const categoryCounts = {
    Todas: validOffers.length,
    Padaria: validOffers.filter((p) => p.categoria === 'Padaria').length,
    'Frios e Laticínios': validOffers.filter((p) => p.categoria === 'Frios e Laticínios').length,
    Hortifrúti: validOffers.filter((p) => p.categoria === 'Hortifrúti').length,
  };

  const displayedOffers = validOffers.filter((p) => {
    if (selectedCategory === 'Todas') return true;
    return p.categoria === selectedCategory;
  });

  return (
    <div className="space-y-5" aria-label="Vitrine Última Hora">
      {/* 1. Tarja Superior de Modo Pré-visualização da Gerente */}
      <div className="bg-[#184E77] text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold shadow-xs">
        <Eye className="w-4 h-4 text-[#D9ED92]" />
        <span>Pré-visualização do cliente — simulação da vitrine com os itens aprovados</span>
      </div>

      {/* 2. Banner Hero Promocional Fiel à Imagem 2 */}
      <div className="bg-gradient-to-r from-[#DCFCE7] via-[#D9ED92]/50 to-[#DCFCE7] p-8 rounded-2xl border border-[#99D98C]/40 relative overflow-hidden shadow-card">
        {/* Folha / Marca d'água vetorial */}
        <div className="absolute right-4 -bottom-6 w-56 h-56 text-[#52B69A]/15 pointer-events-none">
          <svg viewBox="0 0 200 200" fill="currentColor">
            <path d="M45,-75C58,-68,69,-56,76,-43C83,-30,86,-15,84,-1C82,13,75,26,67,38C59,49,50,60,38,67C26,74,13,78,-1,80C-15,81,-30,81,-43,74C-56,68,-68,56,-75,42C-82,28,-85,14,-83,0C-81,-13,-75,-26,-66,-37C-58,-48,-47,-58,-34,-66C-21,-74,-11,-80,2,-83C15,-86,31,-82,45,-75Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D9ED92] text-[#184E77] mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#184E77]" />
            Ofertas da Última Hora
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#184E77] tracking-tight">
            Bons produtos, preços melhores hoje
          </h2>

          <p className="mt-2 text-sm text-[#475569] font-medium">
            Economize e ajude a evitar o desperdício de alimentos.
          </p>
        </div>
      </div>

      {/* 3. Filtros de Categoria em Chips & Nota de Loja */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['Todas', 'Padaria', 'Frios e Laticínios', 'Hortifrúti'].map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#52B69A] text-white shadow-xs font-bold'
                    : 'bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F1F5F9]'
                }`}
              >
                {cat} · {categoryCounts[cat] || 0}
              </button>
            );
          })}
        </div>

        <span className="text-[11px] text-[#94A3B8] font-medium flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          Preços válidos somente na Loja Piloto 01 · 17/11/2026
        </span>
      </div>

      {/* 4. Grid de Produtos Fiel à Imagem 2 */}
      {displayedOffers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-[#E2E8F0] text-[#94A3B8]">
          <Tag className="w-10 h-10 mx-auto text-[#CBD5E1] mb-2" />
          <p className="text-sm font-semibold text-[#184E77]">Nenhuma oferta aprovada no momento</p>
          <p className="text-xs text-[#94A3B8] mt-1">
            As ofertas aparecerão aqui assim que a gerente aprovar as sugestões de preço da IA ou personalizar os valores na tabela.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedOffers.map((p) => {
            const available = (p.quantidadeEmExposicao || 0) + (p.quantidadeNoSelfService || 0);

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                {/* Imagem do Produto com Selo de Desconto */}
                <div className="relative h-44 bg-[#F8FAFC] overflow-hidden">
                  <img
                    src={p.imagemUrl}
                    alt={p.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Selo de Desconto no Canto Superior Esquerdo */}
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-xs font-black bg-[#D9ED92] text-[#184E77] shadow-sm">
                    −{p.descontoPercentual}%
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-[#184E77] line-clamp-1 group-hover:text-[#168AAD] transition-colors">
                      {p.nome}
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      {p.marca}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#F1F5F9]">
                    <div className="line-through text-xs text-[#94A3B8] tabular-nums">
                      {formatCurrency(p.precoOriginal)}
                    </div>
                    <div className="text-2xl font-black text-[#76C893] tabular-nums tracking-tight">
                      {formatCurrency(p.precoAtual)}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#F8FAFC]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                        Válido até {formatDate(p.dataValidade).slice(0, 5)}
                      </span>
                      <span className="font-semibold text-[#184E77] tabular-nums">
                        Restam {available} un.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
