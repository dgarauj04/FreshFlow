import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  Wand2,
  Minus,
  Plus,
  AlertCircle,
  Calendar,
  Sparkles,
  Croissant,
  Milk,
  Apple,
} from 'lucide-react';
import { REFERENCE_DATE, calculateDaysRemaining, getUrgencyMetadata } from '../../utils/rules';
import { formatCurrency } from '../../utils/formatters';

export default function LotModal({
  isOpen,
  onClose,
  onSubmit,
  currentCategoryFilter = 'Todas',
}) {
  if (!isOpen) return null;

  // Categoria inicial respeita o filtro global ativo do Header
  const initialCategory =
    currentCategoryFilter !== 'Todas' ? currentCategoryFilter : 'Padaria';

  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState(initialCategory);
  const [lote, setLote] = useState('LOTE-PAD-031');
  const [quantidadeInicial, setQuantidadeInicial] = useState(40);
  const [dataExposicao, setDataExposicao] = useState(REFERENCE_DATE);
  const [dataValidade, setDataValidade] = useState('2026-11-19'); // Padrão +2 dias
  const [precoOriginal, setPrecoOriginal] = useState('9.50');
  const [descontoInicial, setDescontoInicial] = useState(0);

  // Estados de Validação e Feedback
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // Função para gerar código do lote sequencial automático
  const generateLotCode = (cat = categoria) => {
    const prefixMap = {
      Padaria: 'PAD',
      'Frios e Laticínios': 'FRI',
      Hortifrúti: 'HOR',
    };
    const prefix = prefixMap[cat] || 'LOT';
    const randomSeq = Math.floor(20 + Math.random() * 80);
    return `LOTE-${prefix}-0${randomSeq}`;
  };

  // Atualiza marca padrão e código ao mudar categoria se estiverem nos padrões
  const handleCategoryChange = (cat) => {
    setCategoria(cat);
    if (marca.includes('Carrefort') || marca.includes('Laticínios') || marca.includes('Horta')) {
      if (cat === 'Padaria') setMarca('Padaria Carrefort');
      else if (cat === 'Frios e Laticínios') setMarca('Laticínios Serra');
      else setMarca('Horta Viva');
    }
    setLote(generateLotCode(cat));
  };

  // Cálculo de dias restantes e status dinâmico para a prévia
  const daysRemaining = calculateDaysRemaining(dataValidade, dataExposicao);
  const statusMeta = getUrgencyMetadata(daysRemaining);

  // Atalhos de datas
  const applyDateShortcut = (daysToAdd) => {
    const [year, month, day] = dataExposicao.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + daysToAdd);
    setDataValidade(date.toISOString().split('T')[0]);
  };

  // Cálculo dinâmico do preço promocional
  const numPrecoOriginal = parseFloat(precoOriginal.replace(',', '.')) || 0;
  const numDesconto = Math.max(0, Math.min(90, Number(descontoInicial) || 0));
  const precoPromocional = Number((numPrecoOriginal * (1 - numDesconto / 100)).toFixed(2));
  const valorTotalExposicao = quantidadeInicial * (numDesconto > 0 ? precoPromocional : numPrecoOriginal);

  // Validação
  const validateForm = () => {
    const errs = {};
    if (!nome.trim() || nome.trim().length < 3) {
      errs.nome = 'O nome do produto é obrigatório (mínimo 3 caracteres).';
    }
    if (!lote.trim()) {
      errs.lote = 'O código do lote é obrigatório.';
    }
    if (quantidadeInicial < 1) {
      errs.quantidadeInicial = 'A quantidade inicial deve ser de pelo menos 1 unidade.';
    }
    if (!dataValidade) {
      errs.dataValidade = 'A data de validade é obrigatória.';
    } else if (dataValidade < dataExposicao) {
      errs.dataValidade = 'A validade não pode ser anterior à data de exposição.';
    }
    if (numPrecoOriginal <= 0) {
      errs.precoOriginal = 'Informe um preço original unitário válido maior que zero.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (keepOpen = false) => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    await onSubmit({
      nome,
      categoria,
      lote,
      quantidadeInicial,
      dataExposicao,
      dataValidade,
      precoOriginal: numPrecoOriginal,
      descontoInicial: numDesconto,
    });
    setIsSubmitting(false);

    if (keepOpen) {
      setShowSuccessBanner(true);
      setNome('');
      setLote(generateLotCode(categoria));
      setQuantidadeInicial(30);
      setTimeout(() => setShowSuccessBanner(false), 3000);
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#184E77]/50 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-popover max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-[#E2E8F0] animate-in zoom-in-95 duration-200 my-auto">
        {/* Cabeçalho Fiel à Imagem 1 */}
        <div className="h-18 px-6 border-b border-[#E2E8F0] flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D9ED92] flex items-center justify-center text-[#184E77] shadow-xs">
              <Package className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#184E77] leading-tight">
                Cadastrar Novo Lote
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Registre o produto que entrou em exposição
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#94A3B8] hover:text-[#184E77] hover:bg-[#F1F5F9] rounded-lg transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner de Sucesso para "Salvar e cadastrar outro" */}
        {showSuccessBanner && (
          <div className="bg-[#DCFCE7] text-[#166534] px-6 py-2.5 text-xs font-semibold flex items-center gap-2 border-b border-[#86EFAC]">
            <span>✓ Lote cadastrado com sucesso! Continue adicionando os próximos itens.</span>
          </div>
        )}

        {/* Corpo com Rolagem */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#184E77]">
          {/* GRUPO 1: IDENTIFICAÇÃO DO PRODUTO */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A759F]">
              Identificação do Produto
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#184E77] mb-1.5">
                Nome do produto *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  if (errors.nome) setErrors((prev) => ({ ...prev, nome: null }));
                }}
                placeholder="Ex.: Pão Francês Artesanal 500g"
                className={`w-full h-10 px-3.5 text-sm bg-white border rounded-lg focus:outline-none transition-all ${
                  errors.nome
                    ? 'border-[#B91C1C] ring-2 ring-[#B91C1C]/20'
                    : 'border-[#E2E8F0] focus:border-[#1A759F] focus:ring-2 focus:ring-[#1A759F]/20'
                }`}
              />
              {errors.nome && (
                <p className="text-xs text-[#B91C1C] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.nome}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 w-full ">
              <div className="w-full">
                <label className="block text-xs font-semibold text-[#184E77] mb-1.5">
                  Categoria *
                </label>
                <div className="flex bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0] text-xs">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('Padaria')}
                    className={`flex-1 py-1.5 px-2 rounded-md font-medium flex items-center justify-center gap-1.5 transition-all ${
                      categoria === 'Padaria'
                        ? 'bg-[#168AAD] text-white shadow-xs font-semibold'
                        : 'text-[#475569] hover:text-[#184E77]'
                    }`}
                  >
                    <Croissant className="w-3.5 h-3.5" />
                    Padaria
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('Frios e Laticínios')}
                    className={`flex-1 py-1.5 px-2 rounded-md font-medium flex items-center justify-center gap-1.5 transition-all ${
                      categoria === 'Frios e Laticínios'
                        ? 'bg-[#168AAD] text-white shadow-xs font-semibold'
                        : 'text-[#475569] hover:text-[#184E77]'
                    }`}
                  >
                    <Milk className="w-3.5 h-3.5" />
                    Frios e Lat.
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('Hortifrúti')}
                    className={`flex-1 py-1.5 px-2 rounded-md font-medium flex items-center justify-center gap-1.5 transition-all ${
                      categoria === 'Hortifrúti'
                        ? 'bg-[#168AAD] text-white shadow-xs font-semibold'
                        : 'text-[#475569] hover:text-[#184E77]'
                    }`}
                  >
                    <Apple className="w-3.5 h-3.5" />
                    Hortifrúti
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#184E77] mb-1.5">
                Código do lote *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={lote}
                  onChange={(e) => {
                    setLote(e.target.value);
                    if (errors.lote) setErrors((prev) => ({ ...prev, lote: null }));
                  }}
                  className={`flex-1 h-10 px-3.5 font-mono text-sm bg-white border rounded-lg focus:outline-none ${
                    errors.lote ? 'border-[#B91C1C]' : 'border-[#E2E8F0] focus:border-[#1A759F]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setLote(generateLotCode(categoria))}
                  className="h-10 px-3.5 bg-white border border-[#168AAD] text-[#168AAD] hover:bg-[#E0F2FE] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Gerar
                </button>
              </div>
            </div>
          </section>

          <hr className="border-[#E2E8F0]" />

          {/* GRUPO 2: QUANTIDADE E PRAZOS */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A759F]">
              Quantidade e Prazos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#184E77] mb-1.5">
                  Quantidade inicial *
                </label>
                <div className="flex items-center border border-[#E2E8F0] rounded-xl overflow-hidden bg-[#F8FAFC]">
                  <button
                    type="button"
                    onClick={() => setQuantidadeInicial((q) => Math.max(1, q - 5))}
                    className="w-10 h-10 flex items-center justify-center text-[#184E77] hover:bg-[#E2E8F0] transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantidadeInicial}
                    onChange={(e) => setQuantidadeInicial(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="flex-1 h-10 text-center font-bold text-sm bg-transparent focus:outline-none tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantidadeInicial((q) => q + 5)}
                    className="w-10 h-10 flex items-center justify-center text-[#184E77] hover:bg-[#E2E8F0] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[11px] text-[#94A3B8] block mt-1">
                  Unidades colocadas em exposição
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#184E77] mb-1.5">
                  Data de exposição *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dataExposicao}
                    onChange={(e) => setDataExposicao(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:border-[#1A759F] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#184E77]">
                  Data de validade *
                </label>
                {/* Prévia de status dinâmico ao vivo */}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusMeta.badgeBg} ${statusMeta.badgeText} border ${statusMeta.badgeBorder}`}
                >
                  ⌛ {statusMeta.label}
                </span>
              </div>

              <div className="relative">
                <input
                  type="date"
                  value={dataValidade}
                  onChange={(e) => {
                    setDataValidade(e.target.value);
                    if (errors.dataValidade) setErrors((prev) => ({ ...prev, dataValidade: null }));
                  }}
                  className={`w-full h-10 px-3 text-sm bg-white border rounded-lg focus:outline-none ${
                    errors.dataValidade ? 'border-[#B91C1C]' : 'border-[#E2E8F0] focus:border-[#1A759F]'
                  }`}
                />
              </div>

              {errors.dataValidade && (
                <p className="text-xs text-[#B91C1C] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.dataValidade}
                </p>
              )}

              {/* Atalhos Rápidos de Validade */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {[
                  { label: 'Hoje', days: 0 },
                  { label: '+2 dias', days: 2 },
                  { label: '+5 dias', days: 5 },
                  { label: '+7 dias', days: 7 },
                  { label: '+15 dias', days: 15 },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => applyDateShortcut(chip.days)}
                    className="px-2.5 py-1 text-xs font-medium text-[#475569] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-md transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <hr className="border-[#E2E8F0]" />

          {/* GRUPO 3: PRECIFICAÇÃO */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A759F]">
              Precificação
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#184E77] mb-1.5">
                  Preço original (unitário) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B]">
                    R$
                  </span>
                  <input
                    type="text"
                    value={precoOriginal}
                    onChange={(e) => {
                      setPrecoOriginal(e.target.value);
                      if (errors.precoOriginal) setErrors((prev) => ({ ...prev, precoOriginal: null }));
                    }}
                    className={`w-full h-10 pl-9 pr-3 text-sm font-bold text-[#184E77] bg-white border rounded-lg focus:outline-none tabular-nums ${
                      errors.precoOriginal ? 'border-[#B91C1C]' : 'border-[#E2E8F0] focus:border-[#1A759F]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#184E77] mb-1.5">
                  Desconto inicial (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={descontoInicial}
                    onChange={(e) => setDescontoInicial(e.target.value)}
                    className="w-full h-10 px-3 text-sm font-bold text-[#184E77] bg-white border border-[#E2E8F0] rounded-lg focus:border-[#1A759F] focus:outline-none tabular-nums"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B]">
                    %
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#184E77] mb-1.5">
                  Preço promocional
                </label>
                <div className="w-full h-10 px-3.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg flex items-center text-sm font-bold text-[#184E77] tabular-nums">
                  {formatCurrency(precoPromocional)}
                </div>
              </div>
            </div>

            {/* Card de Resumo ao Vivo Conforme Design System */}
            <div className="p-3.5 bg-[#B5E48C]/20 border border-[#99D98C] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-[#184E77]">
                Valor total em exposição:{' '}
                <strong className="text-sm font-bold tabular-nums">
                  {formatCurrency(valorTotalExposicao)}
                </strong>{' '}
                ({quantidadeInicial} un. × {formatCurrency(numDesconto > 0 ? precoPromocional : numPrecoOriginal)})
              </span>

              {numDesconto > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D9ED92] text-[#184E77]">
                  Economia de {numDesconto}% aplicada
                </span>
              )}
            </div>

            {/* Aviso da IA */}
            <div className="p-3 bg-[#E0F2FE]/50 border border-[#BAE6FD] rounded-xl flex items-start gap-2.5 text-xs text-[#168AAD]">
              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#34A0A4]" />
              <p className="text-[#184E77]">
                Após o cadastro, a <strong>IA FreshFlow</strong> analisará este lote e poderá sugerir um preço promocional dinâmico conforme a proximidade da validade e volume disponível.
              </p>
            </div>
          </section>
        </div>

        {/* Rodapé Fixo Fiel à Imagem 1 */}
        <div className="h-18 px-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-[#94A3B8]">* Campos obrigatórios</span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#E2E8F0] rounded-lg transition-colors border border-[#E2E8F0]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-[#168AAD] hover:bg-[#E0F2FE] rounded-lg transition-colors border border-[#BAE6FD]"
            >
              Salvar e cadastrar outro
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold bg-[#34A0A4] hover:bg-[#2e8f93] text-white rounded-lg shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? 'Cadastrando…' : 'Cadastrar Lote'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
