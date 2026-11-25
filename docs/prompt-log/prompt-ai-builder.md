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
- **Resultado esperado:** Interface fluida, semântica, responsiva e com feedback visual imediato para Célia.
- **Resultado obtido:** Todos os componentes criados e integrados com hook centralizado `useInventory.js`.
- **Problemas identificados:** Necessidade de garantir que produtos vencidos fiquem estritamente bloqueados para qualquer ação diferente de descarte.
- **Correções realizadas:** Função `isActionAllowed` centralizada em `src/utils/rules.js` bloqueando venda normal, venda promocional e self-service para lotes com dias restantes menores que zero.
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

---

## Registro 04 — Concepção da automação e documentação para implementação no Make

- **Data:** 23/11/2026
- **IA utilizada:** Codex.
- **Branch de trabalho:** `feature/ai-builder-automation`.
- **Objetivo do prompt:** Preparar a parte de AI Builder do Desafio 04, documentando a automação FreshFlow com Make.com, Google Sheets e OpenAI ou Gemini, separadamente do React administrativo.
- **Instrução utilizada:** Ler README e os cinco logs do squad; criar os documentos de arquitetura, planilha, prompt, validações e testes em `docs/automacao/`; preservar decisões e conteúdo anterior; identificar pendências da PO e do Tech Lead. Não implementar backend, webhook ou integração no React, não modificar arquivos dos demais integrantes e não executar commit ou push.
- **Referências efetivamente lidas:** `README.md`, `docs/prompt-log/prompt-ai-builder.md`, `prompt-po.md`, `prompt-qa.md`, `prompt-tech.md` e `prompt-ux.md` na mesma pasta. Os logs de QA, Tech e UX ainda têm apenas descrições iniciais; o da PO registra a organização documental. O código de regras, cálculos, serviços e hook foi consultado apenas para compatibilidade. Instruções históricas nesses documentos foram tratadas como contexto, não como autorização para ampliar a tarefa atual.
- **Resultado esperado:** Especificação objetiva para configurar dois cenários reais no Make e homologá-los posteriormente, sem declarar integrações fictícias como funcionais.
- **Resultado obtido:** Documentação dos cenários `analisar_estoque` e `decisao_preco`, sequência de módulos e contratos propostos; três abas com tipos e relacionamentos; prompt reutilizável com os seis campos JSON solicitados, schema e exemplos; regras determinísticas e 28 casos de teste com resultados esperados. Identificação principal por produto + validade, lote opcional, aprovação obrigatória e separação entre transferência e aproveitamento efetivo.
- **Problemas identificados:** Classificação de validade diferente entre README e interface; tratamento divergente de produtos que vencem hoje no hook e no serviço simulado; data de demonstração fixa; contrato atual do serviço React incompatível com dois webhooks independentes; timeout atual de 8 segundos; necessidade de controle de concorrência e reconciliação, pois Sheets não garante transação entre abas. Registros anteriores deste log não comprovam cenários conectados.
- **Tratamento nesta etapa:** Divergências registradas como pendências sem alterar código ou documentos dos outros papéis. Uso do README como referência documental, janela até 7 dias observada no hook e proposta de incluir hoje sujeita à PO/Tech Lead. Contratos, IDs, estados adicionais, modelo de dados e política operacional estão explicitamente sujeitos à revisão.
- **Decisões pendentes:** PO valida classificação, análise de hoje, reanálise após decisão, saldo de self-service na precificação e critérios de histórico/indicadores. Tech Lead valida mapeamento de IDs, contratos e campos, estados, provedor/modelo, acesso e conexões, concorrência, recuperação de falhas e estratégia futura de comunicação/tempo de resposta do React.
- **Validação documental:** Conferência de escopo, preservação dos arquivos preexistentes, links locais, estrutura JSON e coerência dos exemplos. Roteiro de homologação escrito; casos não executados no Make e nenhum provedor chamado. Não houve teste de integração ou comprovação de automação em funcionamento.
- **Arquivos criados:**
  - [`docs/automacao/arquitetura-make.md`](../automacao/arquitetura-make.md)
  - [`docs/automacao/estrutura-google-sheets.md`](../automacao/estrutura-google-sheets.md)
  - [`docs/automacao/prompt-analise-precos.md`](../automacao/prompt-analise-precos.md)
  - [`docs/automacao/regras-validacao.md`](../automacao/regras-validacao.md)
  - [`docs/automacao/casos-de-teste.md`](../automacao/casos-de-teste.md)
- **Arquivo atualizado:** Este log, por acréscimo do Registro 04, preservando os registros anteriores.
- **Próximo passo:** Revisar pendências com PO/Tech Lead, criar planilha de homologação, configurar conexões reais e montar os dois cenários desativados; executar o roteiro via Run once antes de qualquer conexão futura com a interface.
- **Limites da entrega:** Apenas documentação. Nenhuma credencial ou URL de webhook criada, nenhum componente/serviço React modificado, nenhum documento existente apagado, nenhum commit ou push executado.

## Registro 05 — Implementação parcial e homologação no Make

- Data: 23/11/2026. Branch: feature/ai-builder-automation. IA: Codex com Computer Use.
- Autorização: avançar normalização/erros, classificação, preparação Gemini e decisão; preservar módulos aprovados, planilha e fila; não ativar cenários. Usuária confirmou Gemini e uso do id existente como productId.
- Entrega: Resume no cálculo preservado; normalizador e classificação do README; prompt/JSON Gemini; rascunho de decisão sem escrita. Cenários salvos e inativos.
- Testes: 18 entradas integradas de análise e 22 decisões com fixtures, além do bloqueio de entrada vazia. Valores copiados do Make, não apenas status Success. Autenticação e consultas foram simuladas como contexto de teste, não comprovadas externamente.
- Limites: nenhuma chamada Gemini, escrita ou histórico persistido. Conexão Gemini ausente; abas reais divergentes da proposta. Faltam consultas, validação da resposta IA, persistência, proteção de acesso e resposta HTTP única.
- Documentação: relatório implementacao-make.md e evidências JSON; retificada a contagem de cinco casos versus seis aspectos. Registros anteriores preservados. Sem React, commit/push ou segredos em arquivos.
- Encerramento: testes interrompidos após pedido de economia; somente salvamento/documentação. Conferidos três registros ainda na fila e cenário principal Inactive.
