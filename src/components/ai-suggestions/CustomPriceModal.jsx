import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { MAX_DISCOUNT_PERCENT } from '../../utils/rules';

export default function CustomPriceModal({
  product,
  onClose,
  onConfirm,
}) {
  if (!product) return null;

  const originalPrice = product.precoOriginal || 0;
  const minPrice = product.precoMinimo || originalPrice * 0.4;
  const suggestedPrice = product.sugestaoIA?.precoSugerido || originalPrice * 0.7;

  const [priceInput, setPriceInput] = useState(suggestedPrice.toFixed(2));
  const [discountInput, setDiscountInput] = useState(
    Math.round(((originalPrice - suggestedPrice) / originalPrice) * 100)
  );
  const [errorMsg, setErrorMsg] = useState('');

  // Ao alterar o preço, recalcula o desconto
  const handlePriceChange = (val) => {
    setPriceInput(val);
    const num = parseFloat(val.replace(',', '.'));
    if (!isNaN(num) && originalPrice > 0) {
      const disc = Math.round(((originalPrice - num) / originalPrice) * 100);
      setDiscountInput(Math.max(0, disc));
      validate(num, disc);
    }
  };

  // Ao alterar o desconto, recalcula o preço
  const handleDiscountChange = (val) => {
    const disc = parseInt(val, 10);
    setDiscountInput(val);
    if (!isNaN(disc) && originalPrice > 0) {
      const newPrice = Number((originalPrice * (1 - disc / 100)).toFixed(2));
      setPriceInput(newPrice.toFixed(2));
      validate(newPrice, disc);
    }
  };

  const validate = (price, disc) => {
    if (isNaN(price) || price <= 0) {
      setErrorMsg('O preço deve ser superior a zero.');
      return false;
    }
    if (price > originalPrice) {
      setErrorMsg('O preço promocional não pode ser superior ao original.');
      return false;
    }
    if (price < minPrice) {
      setErrorMsg(
        `Preço abaixo do piso comercial de segurança (${formatCurrency(minPrice)}).`
      );
      return false;
    }
    if (disc > MAX_DISCOUNT_PERCENT) {
      setErrorMsg(`O desconto não pode ultrapassar o teto comercial de ${MAX_DISCOUNT_PERCENT}%.`);
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalPrice = parseFloat(priceInput.replace(',', '.'));
    if (validate(finalPrice, discountInput)) {
      onConfirm(product.id, finalPrice);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#184E77]/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-popover max-w-md w-full overflow-hidden border border-[#E2E8F0] animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] text-[#168AAD] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#184E77]">Personalizar Preço</h3>
              <p className="text-xs text-[#94A3B8]">{product.nome}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#94A3B8] hover:text-[#184E77] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Card com sugestão de referência */}
          {product.sugestaoIA && (
            <div className="p-3 bg-[#E0F2FE]/60 border border-[#BAE6FD] rounded-xl text-xs text-[#168AAD]">
              <span className="font-semibold block mb-0.5">Sugestão da IA:</span>
              <p className="text-[#184E77]">
                {formatCurrency(product.sugestaoIA.precoSugerido)} (−{product.sugestaoIA.descontoPercentual}%) · {product.sugestaoIA.justificativa}
              </p>
            </div>
          )}

          {/* Comparativo de Preço e Desconto em 2 colunas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#184E77] uppercase tracking-wider mb-1.5">
                Preço Promocional (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B]">
                  R$
                </span>
                <input
                  type="text"
                  value={priceInput}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 text-sm font-bold text-[#184E77] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:border-[#1A759F] focus:outline-none tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#184E77] uppercase tracking-wider mb-1.5">
                Desconto (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={MAX_DISCOUNT_PERCENT}
                  value={discountInput}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  className="w-full h-10 px-3 text-sm font-bold text-[#184E77] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:border-[#1A759F] focus:outline-none tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B]">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Comparativo Visual ao Vivo */}
          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between text-xs">
            <span className="text-[#64748B]">
              Original: <span className="line-through">{formatCurrency(originalPrice)}</span>
            </span>
            <ArrowRight className="w-4 h-4 text-[#94A3B8]" />
            <span className="font-bold text-[#166534] text-sm tabular-nums">
              Novo: {formatCurrency(parseFloat(priceInput.replace(',', '.')) || 0)} (−{discountInput}%)
            </span>
          </div>

          {/* Mensagem de Erro de Validação */}
          {errorMsg && (
            <div className="p-3 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl flex items-center gap-2 text-xs text-[#B91C1C]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#475569] hover:bg-[#F1F5F9] rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!!errorMsg}
              className="px-5 py-2.5 text-xs font-bold bg-[#34A0A4] hover:bg-[#2e8f93] text-white rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              Confirmar Promoção
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
