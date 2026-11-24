# Arquitetura da automação FreshFlow — Make.com

> Estado executado em 23/11/2026: consultar [implementação e evidências](implementacao-make.md). As etapas abaixo continuam sendo o desenho completo; não representam todas módulos operacionais já conectados.

**Data:** 23/11/2026. **Estado:** proposta técnica para revisão e configuração; nenhum cenário, conexão ou webhook foi criado ou testado nesta etapa.

## Escopo e referências do squad

A automação será desenvolvida no Make, separadamente do React administrativo. Google Sheets guarda os dados; OpenAI **ou** Gemini produz recomendações; a gerente aceita, rejeita ou personaliza. A IA nunca aplica preços.

Foram lidos o [README](../../README.md) e os logs de [AI Builder](../prompt-log/prompt-ai-builder.md), [PO](../prompt-log/prompt-po.md), [QA](../prompt-log/prompt-qa.md), [Tech](../prompt-log/prompt-tech.md) e [UX](../prompt-log/prompt-ux.md). Os logs de QA, Tech e UX contêm apenas descrições iniciais; o da PO registra a organização documental. Não constituem aprovação dos contratos abaixo. Relatos anteriores de integração no log não comprovam conexão real.

Referências adicionais, somente para diagnóstico: `src/utils/rules.js`, `src/services/api.js`, `src/hooks/useInventory.js` e `src/utils/calculations.js`. Nenhum desses arquivos será modificado.

```text
React administrativo → solicitação → Make → Google Sheets
                                      ↓
                                OpenAI ou Gemini
                                      ↓
                         validação determinística
                                      ↓
                         SugestoesIA: PENDING
                                      ↓
React ← resultado ← Make ← decisão explícita da gerente
                              ↓
                    Produtos + SugestoesIA + Movimentacoes
```

## Contratos propostos, sujeitos ao Tech Lead

Cada cenário terá seu próprio Custom webhook, com URL real gerada pelo Make. `analisar_estoque` e `decisao_preco` são nomes lógicos, não caminhos para acrescentar a uma URL. Não há endpoint disponível neste documento. O módulo recebe JSON e a resposta deve ser JSON explícito, inclusive quando não houver produtos. [Referência: Webhooks do Make](https://apps.make.com/gateway).

Entrada do cenário 1, exemplo fictício de contrato:

```json
{
  "requestId": "REQ-ANALISE-EXEMPLO-001",
  "productIds": ["PAD-001"]
}
```

`requestId` identifica a execução lógica e deve ser reutilizado em uma repetição da mesma solicitação. `productIds` é opcional: ausente significa consultar todos os produtos da loja piloto; presente filtra os produtos e inclui suas diferentes validades. A planilha é a fonte de preços, saldo e validade; valores eventualmente enviados pelo cliente não os substituem. Data de referência e política comercial são definidas no Make, não pela IA ou pelo navegador.

Entrada do cenário 2, exemplo fictício:

```json
{
  "decisionId": "DEC-EXEMPLO-001",
  "suggestionId": "SUG-EXEMPLO-001",
  "action": "PERSONALIZAR",
  "customPrice": 15.00,
  "decididoPor": "Dona Célia"
}
```

`action`: `ACEITAR`, `REJEITAR` ou `PERSONALIZAR`. `customPrice` é obrigatório somente ao personalizar; aceitar usa o preço persistido na sugestão. `suggestionId` resolve inequivocamente produto + validade. `decisionId` é a chave de repetição da decisão. O nome informado pelo cliente serve para rastreabilidade no piloto, **não comprova identidade**; proteção de acesso é pendência técnica.

Resposta proposta: `requestId` ou `decisionId`, `success`, `results` e `errors`. Cada item traz `productId`, `dataValidade`, `groupKey`, resultado (`PENDING`, `NO_SUGGESTION`, `SKIPPED`, `BLOCKED` ou `ERROR`) e, quando aplicável, `suggestionId` e os seis campos do retorno da IA. Decisões retornam o status persistido, preço final e ID do histórico. `success=true` somente se todos os itens terminarem sem erro técnico; itens bloqueados por regra podem ser reportados normalmente, com motivo. Em falha parcial, usar `success=false` e preservar os itens já registrados. Lista vazia retorna `results: []`.

## Cenário 1 — analisar_estoque

**Gatilho:** clique da gerente em **Analisar**, em integração futura. O monitoramento agendado citado no README não é configurado nesta entrega; poderá reutilizar regras posteriormente, se priorizado pela PO.

| Etapa | Módulo ou recurso do Make | Finalidade e saída |
|---|---|---|
| 1 | Webhooks — Custom webhook | Receber a solicitação; validar tipos, `requestId` e filtro opcional. Recusar contrato inválido antes de acessar a IA. |
| 2 | Tools — Set multiple variables | Fixar uma data local da execução e a configuração aprovada; gerar correlação para cada item. Consultar [regras](regras-validacao.md). |
| 3 | Google Sheets — Search Rows | Ler Produtos com cabeçalhos e todos os resultados do escopo. Configurar limite/paginação para não analisar silenciosamente só parte da planilha. |
| 4 | Array aggregator; Iterator se houver um array consolidado | Validar unicidade de `groupKey`, ordenar por validade (FEFO) e percorrer os grupos. Search Rows já produz bundles: não adicionar Iterator diretamente sobre cada linha. Se a busca estiver vazia, produzir explicitamente a resposta vazia. |
| 5 | Tools — variáveis/funções de data; filtros | Calcular dias por datas civis, saldo e urgência. Separar vencidos, sem estoque, dados inválidos e validade distante, sem chamada à IA. Produtos de hoje/amanhã são prioridade crítica. |
| 6 | Google Sheets — Search Rows em SugestoesIA | Consultar pendência existente por grupo e registro anterior por `requestId + groupKey`. Reutilizar resultado existente; não criar sugestão duplicada. Mudança de versão exige revisão, conforme regras. |
| 7 | Google Sheets — Search Rows em Movimentacoes; agregação | Montar histórico de vendas confirmadas no período configurado, quando disponível. Ausência de cobertura conhecida vira `null`, nunca vendas zero presumidas. Transferências não são vendas. |
| 8 | JSON — Create JSON | Serializar os campos reais de um único grupo e anexar o [prompt](prompt-analise-precos.md). Nome e histórico são dados, nunca instruções. |
| 9 | OpenAI — Generate a response **ou** Google Gemini AI — Generate a response | Usar uma conexão e modelo aprovados, com saída JSON estruturada quando suportada. Uma chamada por grupo; não enviar a dois provedores simultaneamente. |
| 10 | JSON — Parse JSON; filtros e variáveis | Validar estrutura e todas as regras comerciais de forma independente. `NO_SUGGESTION` não cria pendência. Resposta inválida gera erro do item, sem corrigir silenciosamente o preço. |
| 11 | Google Sheets — Search Rows; Add a Row | Reler Produtos e pendências antes da escrita; conferir versão e saldo. Persistir em SugestoesIA apenas recomendação válida com `status=PENDING`, snapshot e metadados. Não atualizar `precoAtual`. |
| 12 | Agregação dos resultados; JSON — Create JSON; Webhooks — Webhook response | Responder uma vez, após persistir, com sugestões, itens ignorados/bloqueados e erros. Garantir uma saída por item e uma resposta para a solicitação, inclusive em rotas de erro e listas vazias. |

No desenho visual, filtros/Router podem separar resultados, mas rotas não se unem automaticamente. O Tech Lead deve validar o agrupamento em um único caminho de resposta; não colocar uma resposta por produto. Erros tratados devem produzir um item de resultado para não desaparecerem da agregação.

## Cenário 2 — decisao_preco

| Etapa | Módulo ou recurso do Make | Finalidade e saída |
|---|---|---|
| 1 | Webhooks — Custom webhook; validação de contrato | Receber a decisão explícita e validar ação, IDs e preço personalizado, se exigido. |
| 2 | Google Sheets — Search Rows em Movimentacoes | Buscar `decisionId`. Se confirmado e conteúdo idêntico, devolver o resultado anterior sem outra escrita. Mesmo ID com conteúdo diferente é conflito. Registro incompleto vai para reconciliação. |
| 3 | Google Sheets — Search Rows em SugestoesIA e Produtos | Localizar uma única sugestão e o grupo relacionado; conferir se está pendente. Não selecionar por lote opcional ou por `productId` isolado. |
| 4 | Router e filtros | `REJEITAR`: manter preço e saldo, registrar rejeição. `ACEITAR`: usar `suggestedPrice` persistido. `PERSONALIZAR`: usar `customPrice` e guardar também o valor originalmente sugerido. |
| 5 | Tools — variáveis; filtros de validação | Para aceitar/personalizar, recalcular validade, estoque, versão e limites com os dados atuais. Produto vencido, zerado ou alterado impede aplicação. Rejeitar continua possível para encerrar uma pendência antiga, sem aplicar preço. |
| 6 | Google Sheets — Add a Row em Movimentacoes | Preparar evento auditável da decisão com `estadoRegistro=PREPARED`, valores anterior/final, ação, responsável e IDs. Não representa venda nem recuperação. |
| 7 | Google Sheets — Update a Row | Aceitar/personalizar atualiza `Produtos.precoAtual`, `versao` e `atualizadoEm`; rejeitar não muda Produtos. Atualizar SugestoesIA para `APPROVED` ou `REJECTED`, guardando ação, preço final, responsável e data. Personalização usa `APPROVED` + ação `PERSONALIZAR`. |
| 8 | Google Sheets — Update a Row em Movimentacoes; releitura | Confirmar consistência das escritas e marcar evento `COMMITTED`. Falha parcial mantém `PREPARED` para reconciliação, sem anunciar sucesso. |
| 9 | JSON — Create JSON; Webhooks — Webhook response | Retornar decisão persistida. Estoque permanece igual nas três ações. Aprovação não comprova venda, doação ou utilização. |

## Erros, concorrência e limites reais

- Proposta de respostas: 400 para entrada inválida, 404 para ID inexistente, 409 para conflito/estado desatualizado, 422 para violação comercial e 502/503 para falha de dependência. Erro por item na análise em lote é descrito em `errors`; sucesso HTTP sozinho não comprova conclusão.
- Configurar tratamento de falhas de conexão, quota, timeout e JSON inválido. Não fabricar recomendação local como se viesse do provedor. Retentativas devem reutilizar IDs e verificar registros existentes antes de repetir escritas.
- Propor execução em ordem em cada cenário e retenção de execuções incompletas. Essa configuração ordena execuções **do mesmo cenário**; não resolve concorrência entre os dois cenários ou edições manuais. [Referência: configurações de cenário](https://help.make.com/scenario-settings).
- Sheets não oferece transação conjunta entre as três abas. `versao`, releitura e evento `PREPARED/COMMITTED` ajudam a detectar e reconciliar falhas, mas não são lock atômico. Tech Lead deve definir exclusão entre escritores, acesso à planilha e retomada idempotente antes do uso concorrente. Na homologação inicial, executar uma solicitação por vez, sem edição manual simultânea. Não prometer garantia transacional.
- Em falha parcial de decisão, inspecionar o evento por `decisionId`, comparar os valores persistidos, concluir somente as escritas faltantes e confirmar; não aplicar novamente nem desfazer automaticamente uma decisão mais recente. Procedimento de recuperação e módulos finais dependem do Tech Lead.

## Compatibilidade e decisões pendentes

| Responsável | Decisão necessária |
|---|---|
| PO + Tech Lead | Unificar classificação do README (1–7, 8–15, >15) e da interface (2, 3–5, >5); resolver o caso hoje, permitido por `isActionAllowed` e pelo filtro de análise, mas descartado pelo `days <= 0` do serviço simulado. |
| PO | Confirmar janela até 7 dias presente no hook, política de reanálise após rejeição/aprovação, uso do saldo no self-service para análise de preço e período/cobertura do histórico. Não estabelecer percentuais fixos por categoria sem decisão comercial. |
| Tech Lead | Aprovar chaves, tipos, estados, versão, proteção dos webhooks, origem da identidade da gerente, concorrência e recuperação de falhas. Escolher provedor/modelo e orçamento. |
| Tech Lead | Mapear contrato futuro ao React: hoje o serviço concatena uma URL base com caminhos (`analisar-ia`, `aprovar-sugestao` etc.), usa lotes e campos em português, e tem timeout de 8 segundos. Isso não configura os dois webhooks propostos. |
| Tech Lead + PO | Validar se a análise cabe no tempo da interface; se não, aprovar contrato assíncrono e consulta posterior em tarefa futura. Uma resposta padrão de recebimento do Make não equivale a resultados prontos. |

Nenhuma credencial de IA/Google será colocada em `VITE_*` ou no React. Mecanismo de proteção do webhook não pode depender de segredo embutido no navegador. Não implementar backend nesta tarefa; definir a solução de acesso com o Tech Lead antes de expor dados reais.

## Próxima configuração no Make

1. Revisar as pendências com PO/Tech Lead e aprovar os contratos e [modelo de dados](estrutura-google-sheets.md).
2. Criar uma planilha de homologação com as três abas e dados fictícios dos [casos de teste](casos-de-teste.md), sem substituir a aplicação atual.
3. Criar conexões Google e do provedor escolhido na conta autorizada, com credenciais reais fornecidas pela equipe.
4. Montar os dois cenários desativados, gerar seus webhooks próprios e definir estruturas JSON de entrada/saída. Configurar erros, ordem de execução, limites e idempotência.
5. Usar **Run once** com solicitações de teste; conferir as três abas, ausência de duplicidade e recuperação de falhas. Registrar evidências sem segredos. Só depois planejar a conexão da interface em outra tarefa.

Os módulos de planilha e JSON devem ser conferidos no editor da conta durante a montagem. Referências oficiais: [Google Sheets](https://apps.make.com/google-sheets), [JSON](https://apps.make.com/json), [OpenAI](https://apps.make.com/openai-modules) e [Google Gemini AI](https://apps.make.com/gemini-ai). Consulta documental em 23/11/2026; não é evidência de integração executada.
