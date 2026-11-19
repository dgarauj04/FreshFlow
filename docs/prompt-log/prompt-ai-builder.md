# FreshFlow — Prompt Log & Controle de Alterações com IA

Documento de rastreabilidade e governança do desenvolvimento assistido por IA conforme requisitos da KODIE Academy e Carrefort Supermercados.

---

## Registro 01 — Auditoria, Diagnóstico e Arquitetura Base (Etapa 0)

- **Data:** 18/11/2026
- **Objetivo do prompt:** Realizar a auditoria do workspace e estruturar o plano de execução incremental do MVP FreshFlow, alinhando PRD, Design Tokens e regras de negócio.
- **Instrução utilizada:** Leitura das diretrizes, análise do diretório `Developer`, elaboração de artefato de diagnóstico e verificação das referências visuais fornecidas (Imagens 1 a 4).
- **Resultado esperado:** Diagnóstico claro com apresentação das discrepâncias e plano para aprovação prévia antes de criar arquivos estruturais.
- **Resultado obtido:** Criação do artefato de diagnóstico `etapa-0-diagnostico-freshflow.md` detalhando regras de FEFO, distinção entre status conceitual do PRD e agrupamentos de filtro, definição dos 51 produtos mockados e aprovação do usuário para inicialização na subpasta `./freshflow`.
- **Problemas identificados:** O diretório de trabalho raiz possuía 26 projetos sem relação com o FreshFlow; criar arquivos na raiz poluíria os outros projetos.
- **Correções realizadas:** Sugerido e aprovado o isolamento em `./freshflow`.
- **Arquivos afetados:**
  - `etapa-0-diagnostico-freshflow.md`

---

## Registro 02 — Estrutura, Design System e Telas (Etapas 1, 2 e 3)

- **Data:** 18/11/2026
- **Objetivo do prompt:** Configurar Vite + React JSX + Tailwind CSS, implementar a paleta exata de design tokens e construir o App Shell com Sidebar, Header e as 4 telas interativas.
- **Instrução utilizada:** Implementação modular dos componentes:
  - `AppShell.jsx`, `Sidebar.jsx`, `Header.jsx`, `Toast.jsx`
  - Dashboard: `KpiCard.jsx`, `WasteBarChart.jsx`, `UrgencyDonutChart.jsx`, `FefoPreview.jsx`, `RecoverySummary.jsx`
  - Gestão de Validades: `InventoryTable.jsx`, `StockBar.jsx`, `UrgencyBadge.jsx`
  - Modais: `LotModal.jsx` (fiel à Imagem 1 com 3 seções, stepper e atalhos), `DestinationModal.jsx` (bloqueio de vencidos para venda e liberação exclusiva para descarte), `CustomPriceModal.jsx` (sincronização bidirecional entre preço e desconto %)
  - Movimentações: `MovementsTable.jsx` com exportação CSV e indicadores de auditoria
  - Vitrine: `VitrineGrid.jsx` (fiel à Imagem 2 com visualização interna, selos de economia e filtros)
- **Resultado esperado:** Interface fluida, semântica, responsiva e com feedback visual imediato para Dona Célia.
- **Resultado obtido:** Todos os componentes criados e integrados com hook centralizado `useInventory.js`.
- **Problemas identificados:** Necessidade de garantir que produtos vencidos fiquem estritamente bloqueados para qualquer ação diferente de descarte.
- **Correções realizadas:** Função `isActionAllowed` centralizada em `src/utils/rules.js` bloqueando venda normal, venda promocional, doação e self-service para lotes com dias restantes menores que zero.
- **Arquivos afetados:**
  - `src/index.css`
  - `src/utils/formatters.js`
  - `src/utils/rules.js`
  - `src/utils/calculations.js`
  - `src/data/mock.js`
  - `src/services/api.js`
  - `src/hooks/useInventory.js`
  - `src/components/layout/Sidebar.jsx`
  - `src/components/layout/Header.jsx`
  - `src/components/layout/Toast.jsx`
  - `src/components/layout/AppShell.jsx`
  - `src/components/dashboard/KpiCard.jsx`
  - `src/components/dashboard/WasteBarChart.jsx`
  - `src/components/dashboard/UrgencyDonutChart.jsx`
  - `src/components/dashboard/FefoPreview.jsx`
  - `src/components/dashboard/RecoverySummary.jsx`
  - `src/components/dashboard/DashboardView.jsx`
  - `src/components/inventory/UrgencyBadge.jsx`
  - `src/components/inventory/StockBar.jsx`
  - `src/components/inventory/DestinationModal.jsx`
  - `src/components/inventory/LotModal.jsx`
  - `src/components/inventory/InventoryTable.jsx`
  - `src/components/ai-suggestions/CustomPriceModal.jsx`
  - `src/components/offers/VitrineGrid.jsx`
  - `src/components/movements/MovementsTable.jsx`
  - `src/App.jsx`
  - `src/main.jsx`
  - `tailwind.config.js`
  - `vite.config.js`
  - `.env.example`

---

## Registro 03 — Camada de Automação & Make.com (Etapas 4 e 5)

- **Data:** 18/11/2026
- **Objetivo do prompt:** Criar o módulo de integração de webhooks com Make.com, Google Sheets e IA, mantendo os endpoints configuráveis em `.env` e com suporte a fallback de modo demonstrativo.
- **Instrução utilizada:** Criação de `src/services/api.js` e `.env.example` com placeholders `http://[SUA_URL_AQUI].com`, implementação de simulação de IA heurística realista com micro-interações de 1 clique, reversão (toast com "Desfazer") e recálculo dinâmico de KPIs.
- **Resultado esperado:** Sistema que funciona perfeitamente tanto desconectado quanto conectado aos webhooks reais do Make.com.
- **Resultado obtido:** Implementado com sucesso em `src/services/api.js`.
- **Arquivos afetados:**
  - `src/services/api.js`
  - `.env.example`
