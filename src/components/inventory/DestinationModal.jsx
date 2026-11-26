import React, { useState } from 'react';
import { X, AlertTriangle, ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { calculateDaysRemaining } from '../../utils/rules';
import { formatCurrency } from '../../utils/formatters';

export default function DestinationModal({
  product,
  defaultAction = 'venda_normal',
  onClose,
  onConfirm,
}) {
  if (!product) return null;

  const days = calculateDaysRemaining(product.dataValidade);
  const isExpired = days < 0;
  const available = (product.quantidadeEmExposicao || 0) + (product.quantidadeNoSelfService || 0);

  const [selectedAction, setSelectedAction] = useState(isExpired ? 'descarte' : defaultAction);
  const [quantity, setQuantity] = useState(Math.min(available, 1));
  const [notes, setNotes] = useState('');

  const destinations = [
    {
      id: 'venda_normal',
      label: 'Venda Normal',
      desc: 'Saída convencional do salão de vendas',
      disabled: isExpired,
    },
    {
      id: 'venda_promocional',
      label: 'Venda Promocional',
      desc: 'Item vendido com desconto aplicado',
      disabled: isExpired,
    },
    {
      id: 'self_service_transfer',
      label: 'Transferência para Self-Service',
      desc: 'Alocação interna de estoque (não contabiliza recuperação)',
      disabled: isExpired,
    },
    {
      id: 'utilizacao_self_service',
      label: 'Utilização Efetiva no Self-Service',
      desc: 'Alimento efetivamente consumido na cozinha/restaurante',
      disabled: isExpired,
    },
    {
      id: 'descarte',
      label: 'Descarte Sanitário',
      desc: 'Remoção e perda sanitária obrigatória',
      isDestructive: true,
      disabled: false,
    },
  ];

  const handleIncrement = () => {
    if (quantity < available) setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(product.id, selectedAction, quantity, notes);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#184E77]/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-popover max-w-lg w-full overflow-hidden border border-[#E2E8F0] animate-in zoom-in-95 duration-200">
        {/* Cabeçalho */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div>
            <h3 className="text-base font-bold text-[#184E77]">Registrar Destino Operacional</h3>
            <p className="text-xs text-[#94A3B8]">
              {product.nome} · Lote: <span className="font-mono text-[#184E77]">{product.lote}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#94A3B8] hover:text-[#184E77] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Alerta de Produto Vencido */}
          {isExpired && (
            <div className="p-3 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl flex items-start gap-3 text-xs text-[#B91C1C]">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="font-bold block">Produto Vencido!</span>
                Por normas de segurança alimentar, produtos vencidos estão estritamente bloqueados para venda ou self-service. Apenas o <strong>Descarte</strong> é permitido.
              </div>
            </div>
          )}

          {/* Seleção do Tipo de Destino */}
          <div>
            <label className="block text-xs font-semibold text-[#184E77] uppercase tracking-wider mb-2">
              Tipo de Movimentação *
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-44 overflow-y-auto pr-1">
              {destinations.map((d) => (
                <label
                  key={d.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    d.disabled
                      ? 'opacity-40 cursor-not-allowed bg-[#F1F5F9] border-[#E2E8F0]'
                      : selectedAction === d.id
                      ? d.isDestructive
                        ? 'bg-[#FEF2F2] border-[#B91C1C] ring-1 ring-[#B91C1C]'
                        : 'bg-[#F0F9FF] border-[#168AAD] ring-1 ring-[#168AAD]'
                      : 'hover:bg-[#F8FAFC] border-[#E2E8F0]'
                  }`}
                >
                  <input
                    type="radio"
                    name="destination"
                    value={d.id}
                    disabled={d.disabled}
                    checked={selectedAction === d.id}
                    onChange={() => setSelectedAction(d.id)}
                    className="mt-0.5 text-[#168AAD] focus:ring-[#168AAD]"
                  />
                  <div className="flex-1">
                    <span
                      className={`font-semibold block ${
                        d.isDestructive ? 'text-[#B91C1C]' : 'text-[#184E77]'
                      }`}
                    >
                      {d.label}
                    </span>
                    <span className="text-[#64748B] block text-[11px]">{d.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Seletor de Quantidade (Stepper) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#184E77] uppercase tracking-wider">
                Quantidade a Movimentar *
              </label>
              <span className="text-xs text-[#64748B]">
                Disponível no lote: <strong className="text-[#184E77]">{available} un.</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#E2E8F0] rounded-xl overflow-hidden bg-[#F8FAFC]">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center text-[#184E77] hover:bg-[#E2E8F0] disabled:opacity-30 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  max={available}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setQuantity(Math.min(available, Math.max(1, val)));
                    }
                  }}
                  className="w-16 h-10 text-center font-bold text-[#184E77] bg-transparent focus:outline-none tabular-nums"
                />
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={quantity >= available}
                  className="w-10 h-10 flex items-center justify-center text-[#184E77] hover:bg-[#E2E8F0] disabled:opacity-30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setQuantity(available)}
                className="px-3 py-2 text-xs font-semibold text-[#168AAD] hover:bg-[#E0F2FE] rounded-lg transition-colors border border-[#BAE6FD]"
              >
                Tudo ({available} un.)
              </button>
            </div>
          </div>

          {/* Observações Opcionais */}
          <div>
            <label className="block text-xs font-semibold text-[#184E77] uppercase tracking-wider mb-1.5">
              Observações (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: Transferência matinal para produção de refeições"
              className="w-full h-10 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#184E77] focus:border-[#1A759F] focus:outline-none"
            />
          </div>

          {/* Impacto Financeiro Estimado */}
          <div className="p-3 bg-[#F1F5F9] rounded-xl flex items-center justify-between text-xs">
            <span className="text-[#64748B]">Impacto Comercial Calculado:</span>
            <span
              className={`font-bold tabular-nums text-sm ${
                selectedAction === 'descarte' ? 'text-[#B91C1C]' : 'text-[#166534]'
              }`}
            >
              {selectedAction === 'descarte' ? '− ' : '+ '}
              {formatCurrency(quantity * (product.precoOriginal || 0))}
            </span>
          </div>

          {/* Botões do Rodapé */}
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
              className={`px-5 py-2.5 text-xs font-bold rounded-lg text-white shadow-xs transition-colors flex items-center gap-1.5 ${
                selectedAction === 'descarte'
                  ? 'bg-[#B91C1C] hover:bg-[#991b1b]'
                  : 'bg-[#34A0A4] hover:bg-[#2e8f93]'
              }`}
            >
              {selectedAction === 'descarte' && <Trash2 className="w-3.5 h-3.5" />}
              Confirmar Destino
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
