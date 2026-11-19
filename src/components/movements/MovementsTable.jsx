import React, { useState } from 'react';
import {
  Download,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  Trash2,
  Tag,
  Shuffle,
  HeartHandshake,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function MovementsTable({ movements }) {
  const [filterType, setFilterType] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const typeLabels = {
    preco_alterado_ia: {
      label: 'Preço Alterado pela IA',
      bg: 'bg-[#E0F2FE]',
      text: 'text-[#168AAD]',
    },
    preco_personalizado: {
      label: 'Preço Personalizado',
      bg: 'bg-[#DCFCE7]',
      text: 'text-[#166534]',
    },
    sugestao_rejeitada: {
      label: 'Sugestão Rejeitada',
      bg: 'bg-[#F1F5F9]',
      text: 'text-[#64748B]',
    },
    venda_normal: {
      label: 'Venda Normal',
      bg: 'bg-[#DCFCE7]',
      text: 'text-[#166534]',
    },
    venda_promocional: {
      label: 'Venda Promocional',
      bg: 'bg-[#D9ED92]/50',
      text: 'text-[#184E77]',
    },
    self_service_transfer: {
      label: 'Transf. Self-Service',
      bg: 'bg-[#F1F5F9]',
      text: 'text-[#475569]',
    },
    utilizacao_self_service: {
      label: 'Utilizado no Self-Service',
      bg: 'bg-[#DCFCE7]',
      text: 'text-[#166534]',
    },
    doacao: {
      label: 'Doação',
      bg: 'bg-[#E0F2FE]',
      text: 'text-[#168AAD]',
    },
    descarte: {
      label: 'Descartado',
      bg: 'bg-[#FEE2E2]',
      text: 'text-[#B91C1C]',
    },
    cadastro_lote: {
      label: 'Lote Cadastrado',
      bg: 'bg-[#DCFCE7]',
      text: 'text-[#166534]',
    },
  };

  const filtered = movements.filter((m) => {
    if (filterType !== 'todos' && m.tipo !== filterType) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return (
        m.produtoNome.toLowerCase().includes(q) ||
        m.lote.toLowerCase().includes(q) ||
        (m.observacoes && m.observacoes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID;DataHora;Produto;Lote;Tipo;Quantidade;ValorUnitario;Impacto;Responsavel;Observacoes']
        .concat(
          filtered.map(
            (m) =>
              `${m.id};${m.dataHora};${m.produtoNome};${m.lote};${m.tipo};${m.quantidade};${m.precoUnitario};${m.impactoTexto};${m.responsavel};${m.observacoes || ''}`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `freshflow_movimentacoes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="space-y-4" aria-label="Histórico de Movimentações">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#184E77]">
            Histórico de Movimentações
          </h1>
          <p className="text-xs text-[#64748B]">
            Trilha de auditoria das decisões de preço, destinações e impactos operacionais
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="px-3.5 py-2 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#184E77] text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#168AAD]" />
          Exportar relatório
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative max-w-sm w-full">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por produto, lote ou observação..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#184E77] focus:border-[#1A759F] focus:outline-none"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-8 px-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#184E77] focus:border-[#1A759F] focus:outline-none"
          >
            <option value="todos">Todos os tipos</option>
            <option value="preco_alterado_ia">Preço alterado pela IA</option>
            <option value="preco_personalizado">Preço personalizado</option>
            <option value="sugestao_rejeitada">Sugestão rejeitada</option>
            <option value="venda_normal">Venda normal</option>
            <option value="venda_promocional">Venda promocional</option>
            <option value="utilizacao_self_service">Self-Service</option>
            <option value="doacao">Doação</option>
            <option value="descarte">Descarte</option>
          </select>
        </div>

        <span className="text-xs text-[#64748B] whitespace-nowrap">
          {filtered.length} registros encontrados
        </span>
      </div>

      {/* Tabela de Auditoria */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F1F5F9] sticky top-0 z-10 border-b border-[#E2E8F0] text-[#475569] uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-3.5 min-w-[130px]">Data & Hora</th>
                <th className="py-3 px-3.5 min-w-[180px]">Produto & Lote</th>
                <th className="py-3 px-3.5 min-w-[150px]">Ação Executada</th>
                <th className="py-3 px-3.5 min-w-[80px]">Qtd.</th>
                <th className="py-3 px-3.5 min-w-[110px]">Operador</th>
                <th className="py-3 px-3.5 min-w-[160px]">Impacto Financeiro</th>
                <th className="py-3 px-3.5 min-w-[200px]">Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#94A3B8]">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const badge = typeLabels[m.tipo] || {
                    label: m.tipo,
                    bg: 'bg-[#F1F5F9]',
                    text: 'text-[#475569]',
                  };

                  return (
                    <tr key={m.id} className="hover:bg-[#F8FAFC] transition-colors">
                      {/* Data / Hora */}
                      <td className="py-3.5 px-3.5 tabular-nums text-[#64748B]">
                        {formatDateTime(m.dataHora)}
                      </td>

                      {/* Produto & Lote */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-semibold text-sm text-[#184E77] leading-tight">
                          {m.produtoNome}
                        </div>
                        <div className="font-mono text-[11px] text-[#94A3B8] leading-tight mt-0.5">
                          {m.lote}
                        </div>
                      </td>

                      {/* Tipo de Ação */}
                      <td className="py-3.5 px-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Quantidade */}
                      <td className="py-3.5 px-3.5 font-bold text-[#184E77] tabular-nums">
                        {m.quantidade} un.
                      </td>

                      {/* Operador */}
                      <td className="py-3.5 px-3.5 font-medium text-[#184E77]">
                        {m.responsavel || 'Dona Célia'}
                      </td>

                      {/* Impacto */}
                      <td className="py-3.5 px-3.5 tabular-nums">
                        <span
                          className={`font-bold inline-flex items-center gap-1 ${
                            m.impactoTipo === 'positivo'
                              ? 'text-[#166534]'
                              : m.impactoTipo === 'negativo'
                              ? 'text-[#B91C1C]'
                              : 'text-[#64748B]'
                          }`}
                        >
                          {m.impactoTipo === 'positivo' && <ArrowUpRight className="w-3.5 h-3.5" />}
                          {m.impactoTipo === 'negativo' && <ArrowDownRight className="w-3.5 h-3.5" />}
                          {m.impactoTexto}
                        </span>
                      </td>

                      {/* Observações */}
                      <td className="py-3.5 px-3.5 text-[#64748B] text-xs">
                        {m.observacoes || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
