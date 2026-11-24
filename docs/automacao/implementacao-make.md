# Implementação no Make — 23/11/2026

O núcleo de normalização e classificação está salvo. **O MVP completo ainda depende da integração externa e dos módulos de persistência e resposta.** Todos os cenários estão inativos; planilha intacta; três registros continuam na fila. React não foi modificado. Sem commit/push.

## Configuração entregue

| Cenário | Estado salvo |
|---|---|
| [Principal 5062742](https://us1.make.com/577610/scenarios/5062742/edit) | Webhook 1, Search Rows 3 e fórmula aprovada do Tools 4 preservados. Acrescentados Resume 7, normalizador 8, classificação 11 e preparação Gemini 14. |
| [Homologação 5063220](https://us1.make.com/577610/scenarios/5063220/edit) | Fixtures → cálculo com Resume → normalização → classificação → preparação Gemini → evidências. Sem webhook, Sheets ou chamada de IA. |
| [Decisão 5063231](https://us1.make.com/577610/scenarios/5063231/edit) | Rascunho: JSON controlado → validação comercial → evidências. Sem escrita ou endpoint operacional. Entrada restaurada para nulls e verificações false após homologação. |

Normalização converte BRL em números/centavos, valida preços, quantidades não negativas e datas reais. Dados ausentes não viram zero. Formatos ambíguos e precisão monetária excessiva são recusados. Falha de parseDate usa Resume com diasRestantes=null, bloqueia o item e permite continuar. Falha da conexão Sheets ainda interrompe com erro visível; sua resposta HTTP estruturada permanece pendente.

O cálculo aprovado usa DD/MM/YYYY e America/Sao_Paulo; o normalizador produz ISO. Aceitar ISO no normalizador isolado não comprova suporte a ISO em toda a cadeia. A origem operacional atual continua DD/MM/YYYY.

Classificação do README: <0 VENCIDO; 0 VENCE_HOJE; 1–7 PROXIMO_DO_VENCIMENTO; 8–15 ATENCAO; >15 NORMAL. Preparação IA exige dados válidos, dias entre 0 e 7 e saldo positivo. Piso = max(minimoCentavos, ceil(originalCentavos × 0,30)). Divergências de política com a interface continuam para PO/Tech Lead antes de produção.

## Campos obrigatórios e ausências

Obrigatórios para analisar: id/productId, nome, categoria, validade real, dias calculados, quantidades de exposição/self-service e preços original/atual/mínimo válidos. Estoque zero é válido, mas inelegível.

A usuária autorizou usar o id existente como productId e escolheu Gemini. groupKey deriva de produto + validade; lote opcional. Histórico indisponível, unidade, versao e atualizadoEm permanecem null. Não foram criados dados cadastrais. A ausência de unidade não bloqueia a preparação individual, mas impede somar produtos de unidades desconhecidas. Versão/timestamp do schema proposto dependem do Tech Lead; antes de escrita, reler e comparar snapshot e definir controle entre escritores.

## IA e decisão: preparação, não operação completa

Tools 14 monta instrução freshflow-precos-v1 e JSON escapado, com histórico/unidade null e aprovação humana obrigatória. Não chama Gemini nem fabrica sugestão. Elegibilidade comercial não substitui consulta de duplicidade antes da chamada.

O rascunho de decisão calcula preço/status/evento **propostos** para ACEITAR, REJEITAR e PERSONALIZAR. Aceite/personalização verificam mínimo, teto de 70%, precisão, validade, saldo e snapshot. Rejeição mantém preço e pode encerrar pendência vencida. Todas as saídas mantêm executarGravacao=false, movimentação zero e recuperação zero.

gerenteAutorizada, identidadeConferida, snapshotConferido, idempotenciaConferida e tiposConferidos são travas que deverão ser produzidas por módulos confiáveis, nunca aceitas do navegador como prova. Autenticação, consultas reais, comparação de snapshot, idempotência e validação estrita de tipos não estão conectadas. As fixtures controlam essas travas; não comprovam seus mecanismos externos. Uma sonda isolada de equal falhou nesta conta e foi removida; os fluxos entregues não dependem dessa função.

## Evidências efetivamente executadas

**18 entradas na cadeia de análise**, com saídas copiadas do Make e 21 verificações consolidadas aprovadas:

| Casos | Valores observados |
|---|---|
| Vencido / hoje / amanhã / 5 / 7 dias | -6 / 0 / 1 / 5 / 7; classificações corretas; vencido inelegível |
| 8 / 15 / 16 dias | ATENCAO / ATENCAO / NORMAL; inelegíveis |
| Estoque zero | Saldo 0; inelegível |
| Mínimo ausente, preço ambíguo, quantidade negativa, ID ausente | DADOS_INVALIDOS, inelegíveis |
| Data impossível e texto banana | Dias null, Resume acionado duas vezes, itens bloqueados |
| Item após erro | Dias 5; processado normalmente |
| Decimais BR | Saldo 3.25 e piso 37037 centavos |
| Original 20.01, mínimo 0 | Piso 601 centavos |

JSON preparado para Gemini válido nos 18 casos, inclusive nome com aspas, dia zero e nulls. [Saídas e verificações](evidencias/testes-integrados-make.json).

**22 entradas de decisão**, todas com preço/validade esperados: aceitar propôs 14 e 30%; rejeitar manteve 20; personalizar propôs 15 e 25%. Preço 6 com original 20/mínimo 2 passou no teto de 70%; 5 foi bloqueado. Original 20.01 bloqueou 6.00 e aceitou 6.01. Também foram bloqueados mínimo violado/ausente, precisão excessiva, original zero/inválido, vencido para aceite, saldo zero, snapshot divergente, autorização ausente, estado encerrado, idempotência não conferida, ID ausente, ação inválida e trava de tipos false. Rejeitar vencido manteve o preço. [Entradas, saídas e verificações](evidencias/testes-decisoes-make.json).

Entrada vazia foi testada separadamente: decisaoValida=false e precoFinalProposto=null. Nenhum teste gravou preço ou histórico. Os CT-01–28 continuam sendo roteiro: estas evidências não comprovam Gemini, autenticação real, duplicidade por consulta, persistência, concorrência ou integração React. A divergência de cinco casos versus seis aspectos está retificada em casos-de-teste.md.

## Dependências e próximos passos

1. Configurar conexão Gemini e escolher modelo/orçamento. O conector inspecionado ofereceu Create a connection; não havia conexão disponível.
2. Aprovar armazenamento: a planilha real tem Produtos, Descarte e Movimentacao; não tem SugestoesIA e Movimentacoes nos contratos propostos. Nenhuma aba foi criada ou renomeada.
3. Conectar Gemini, validar independentemente os seis campos de saída, garantir agrupamento/unicidade e consultar pendências antes de persistir PENDING.
4. Conectar entrada protegida, releituras confiáveis, idempotência, atualização de preço/status e histórico com recuperação de falha parcial no cenário de decisão.
5. Implementar agregação e resposta HTTP única, inclusive erros/lista vazia. O principal ainda não tem Webhook response. Contrato com React permanece pendente, sem alterar componentes.
6. Homologar os caminhos externos em dados autorizados, preservando a fila. Ativação exige autorização expressa.

Ao pedido de economia, nenhuma nova execução de teste foi iniciada; apenas salvamento e documentação foram concluídos. Segredos e URLs de webhook não foram registrados nos arquivos.
