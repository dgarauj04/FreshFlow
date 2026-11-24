# Casos de teste da automação — FreshFlow

**Estado:** roteiro de homologação, ainda não executado no Make. Os exemplos são fictícios. Não validar integração real com base no fallback da aplicação React.

## Preparação e procedimento

Usar cópia de homologação das três abas propostas. Fixar `dataReferencia=2026-11-23` e fuso `America/Sao_Paulo` na configuração de teste do Make. Em uso real, calcular a data; o cliente não escolhe o relógio operacional.

Base de cada caso, salvo alteração explícita: `productId=PAD-001`, nome Pão Integral Formato Especial, categoria Padaria, unidade `un`, exposição 20, self-service 0, original R$ 20,00, atual R$ 20,00, mínimo R$ 8,00, versão 1, histórico indisponível (`null`). Cada execução isolada usa IDs novos; testes de repetição reutilizam os mesmos IDs. Limite inferior da base: R$ 8,00. Não exigir que a IA real escolha um desconto exato.

Para testar validadores, fornecer respostas controladas ao ponto de saída do módulo de IA em homologação, identificadas como fixtures. Para testar o provedor, fazer outra execução real e avaliar formato/limites, sem apresentá-la como o resultado já obtido deste roteiro.

Passos gerais: preparar os registros descritos, executar **Run once**, enviar a solicitação ao webhook real de homologação, inspecionar filtros e módulos, conferir resposta e comparar as três abas antes/depois. Para decisões, criar antes uma sugestão pendente válida e o snapshot da versão correspondente.

## Casos obrigatórios

| ID | Caso e entrada | Ação | Resultado esperado |
|---|---|---|---|
| CT-01 | Produto vencido: validade `2026-11-22` | Solicitar análise; tentar aceitar uma pendência antiga | Dias = -1; nenhuma chamada à IA nem nova pendência; aplicação bloqueada, preço/saldo iguais. Somente descarte físico é permitido. |
| CT-02 | Vence amanhã: validade `2026-11-24` | Analisar com fixture R$ 14,00, desconto 30%, status PENDING | Dias = 1; prioridade crítica; urgency PROXIMO_DO_VENCIMENTO; criar uma pendência. Preço atual continua R$ 20,00 e estoque 20 até decisão. |
| CT-03 | Vence em 5 dias: validade `2026-11-28` | Analisar com resposta comercialmente válida | Dias = 5; elegível na janela até 7 dias; criar PENDING, sem aplicar preço. No contrato baseado no README, urgency PROXIMO_DO_VENCIMENTO; divergência com rótulo Monitoramento da interface fica registrada para PO/Tech Lead. |
| CT-04 | Validade distante: `2026-12-13` | Analisar | Dias = 20; NORMAL; ignorar com motivo fora da janela, sem chamada ao provedor, pendência ou alteração de preço. |
| CT-05 | Sem estoque: validade `2026-11-24`, exposição 0 e self-service 0 | Analisar; tentar aceitar pendência anterior | Análise ignora com motivo sem estoque; nenhuma chamada à IA; aplicação bloqueada. Nenhum saldo negativo ou alteração de preço. |
| CT-06 | Abaixo do mínimo: validade `2026-11-24`, fixture R$ 7,00 e 65% | Analisar | Retorno recusado, pois mínimo é R$ 8,00; não persistir PENDING nem corrigir para R$ 8,00 silenciosamente. Retornar erro do item; Produtos intacta. |
| CT-07 | Gerente aceita: pendência válida de R$ 14,00 e 30%, validade `2026-11-24` | ACEITAR com suggestionId e decisionId inéditos | Preço atual R$ 14,00; sugestão APPROVED; um evento `preco_alterado_ia` COMMITTED com preço anterior 20 e final 14. Estoque 20; recuperação zero; versão do produto incrementada. |
| CT-08 | Gerente rejeita: mesma pendência válida, teste isolado | REJEITAR | Preço R$ 20,00 e estoque 20 mantidos; sugestão REJECTED; um evento `sugestao_rejeitada` COMMITTED. Decisão auditável e recuperação zero. |
| CT-09 | Gerente personaliza: sugestão de R$ 14,00, escolhe R$ 15,00 | PERSONALIZAR | Preço R$ 15,00; desconto final recalculado 25%; sugestão APPROVED com ação PERSONALIZAR e preço sugerido 14 preservado; evento `preco_personalizado` COMMITTED. Estoque não muda. |
| CT-10 | Sugestão duplicada: já existe PENDING válido para produto + validade | Repetir Analisar, inclusive com outro requestId | Retornar a pendência existente, sem nova chamada à IA ou inserção para esse grupo. Não sobrescrever a sugestão. Repetição do requestId original também não duplica. |

## Casos complementares para limites e auditoria

| ID | Preparação/ação | Resultado esperado |
|---|---|---|
| CT-11 | Validade hoje, `2026-11-23` | Dias = 0 e VENCE_HOJE. Sob a proposta de incluir hoje, criar PENDING se os demais dados forem válidos. Caso condicionado à decisão PO/Tech Lead; não marcar como política aprovada nem tratar hoje como vencido. |
| CT-12 | Original 20, mínimo 2; fixture de preço 5 e desconto 75% | Rejeitar por ultrapassar 70%; nenhum preço alterado ou pendência criada. |
| CT-13 | Original 20, mínimo 2; fixture de preço 6 e desconto 70% | Aceitar como recomendação PENDING no limite; gerente ainda precisa aprovar. |
| CT-14 | Original 20,01, mínimo 0; preço 6,00; depois testar 6,01 com percentual coerente | 6,00 bloqueado pelo limite exato; piso é 6,01. O segundo passa na regra comercial; eventual pendência anterior do teste deve estar ausente. |
| CT-15 | PERSONALIZAR com 7,00, zero, negativo, número em string ou campo ausente; cada tentativa isolada | Recusar, manter pendência/preço/saldo; registrar erro com decisionId. Nenhum evento de decisão confirmado. |
| CT-16 | Fixture com JSON inválido, campo extra, productId diferente, urgency diferente, desconto incoerente ou status APPROVED | Recusar em cada variação. Não gravar sugestão nem confiar na autorização da IA. |
| CT-17 | Histórico null; depois objeto com período completo e vendas reais confirmadas | No primeiro, não afirmar vendas zero ou tendência. No segundo, usar apenas fatos fornecidos; nenhuma venda fabricada. Transferências não entram no histórico de vendas. |
| CT-18 | Mesmo produto/validade com referências de lotes A e B, ou lote ausente | Uma linha consolidada e no máximo uma pendência para o par. Lote não é obrigatório nem parte da chave. Se houver preços incompatíveis ou duas linhas não saneadas, bloquear por inconsistência. |
| CT-19 | Mesmo productId com validades `2026-11-24` e `2026-11-28` | Dois grupos distintos. Resposta de cada chamada ligada à validade correta pelo contexto; decisão em um grupo não altera o outro. |
| CT-20 | Após análise, mudar saldo ou preço e incrementar versão; tentar ACEITAR | Conflito de versão; não aplicar recomendação antiga. Invalidar conforme convenção aprovada e exigir nova análise. Em execução isolada, REJEITAR uma sugestão antiga ainda PENDING deve encerrá-la sem aplicar preço. |
| CT-21 | Reenviar decisionId já COMMITTED com o mesmo conteúdo; depois com conteúdo diferente | Primeira repetição retorna o resultado anterior, sem nova escrita. Segunda gera conflito. Outra decisão sobre sugestão já encerrada também não altera preço. |
| CT-22 | Falha após atualização do preço e antes da conclusão do histórico | Não anunciar sucesso; evento fica PREPARED, fora dos indicadores. Reconciliação por decisionId completa apenas passos faltantes, sem segundo evento ou segunda aplicação. Validar solução final do Tech Lead. |
| CT-23 | Simular indisponibilidade/timeout do provedor ou do Sheets | Resposta de erro sem recomendação fictícia; itens já persistidos identificados na falha parcial; retentativa não duplica. Timeout no cliente não equivale a operação cancelada no Make. |
| CT-24 | Dois cliques simultâneos em Analisar e decisões concorrentes | Deve haver no máximo uma pendência e uma decisão confirmada por sugestão. Verificar também concorrência entre cenários; caso bloqueia homologação até o controle entre escritores ser definido e testado. Execução em ordem por cenário isoladamente não comprova essa garantia. |
| CT-25 | Exposição 20, self-service 0: transferir 5; depois registrar utilização real de 3 | Após transferência: exposição 15, self-service 5, total 20, recuperação zero. Após utilização: self-service 2, total 17, somente 3 unidades recuperadas. Avaliar no fluxo físico futuro, fora dos dois cenários de preço. |
| CT-26 | Exposição 2 e self-service 10: tentar transferir 3 da exposição; tentar qualquer quantidade negativa | Bloquear por saldo da origem/quantidade inválida, apesar do total disponível. Nenhuma baixa parcial, estoque negativo ou recuperação. Caso do fluxo físico futuro. |
| CT-27 | Datas ausentes/impossíveis, mínimo ausente, quantidade negativa ou chave duplicada | Bloquear grupo antes do provedor; erro explícito. Não converter ausência em zero, não normalizar data inválida, não somar duplicidade sem saneamento. |
| CT-28 | Sem produtos ou todos inelegíveis | Retornar uma única resposta JSON, com results vazio ou itens ignorados/bloqueados conforme o caso. Nenhuma chamada à IA nem timeout por falta de bundles. |

## Evidências e saída da homologação

Registrar, para cada execução: ID do caso, data/hora, requestId/decisionId, IDs dos registros afetados, saída dos filtros, resposta sem segredos, comparação das abas e resultado **não executado / aprovado / reprovado / bloqueado por decisão pendente**. Verificar também rejeições e falhas, não apenas o caminho de aceite.

QA valida o roteiro; PO resolve classificação/política de hoje, reanálise e indicadores; Tech Lead aprova contratos, concorrência e recuperação. Estes casos não foram executados pelo simples ato de criar a documentação. CT-25/26 especificam o contrato de estoque para implementação posterior e não comprovam um cenário físico configurado.

## Retificação das evidências de normalização — 23/11/2026

Os resultados anteriores correspondem a **cinco execuções isoladas (N1–N5)** do normalizador Tools, com múltiplas verificações em cada execução. As **seis linhas do resumo anterior eram aspectos verificados**, não seis casos independentes. O consolidado contém 14 verificações; isso não equivale a 14 execuções nem a teste integrado.

| Caso executado | Entrada característica | Resultado observado |
|---|---|---|
| N1 | Preços R$ 12,00 / R$ 6,00; exposição 30; self-service 0; 28/11/2026; lote vazio | Preços 12 e 6; saldo 30; validade ISO; lote null; campos básicos válidos. |
| N2 | R$ 1.234,56; mínimo 0; quantidades 2,5 e 0,75; data ISO | Original 1234.56; saldo 3.25; data válida. |
| N3 | Nome/mínimo ausentes, quantidade -1 e 31/02/2026 | Campos inválidos/null; DADOS_INVALIDOS. |
| N4 | Original 1.234 ambíguo; atual 12,345; quantidade abc; 29/02/2025 | Formatos recusados; DADOS_INVALIDOS. |
| N5 | Original/atual 12; mínimo 13; saldo zero; 29/02/2028 | Data bissexta válida; preços inconsistentes; DADOS_INVALIDOS. |

N3 e N4 combinam defeitos: não comprovam separadamente cada bloqueio. Naquela versão, `normalizacaoValida=false` era uma trava cadastral provisória. O `diasRestantes` simulado no teste do normalizador era texto; os três testes aprovados do módulo de cálculo comprovaram separadamente os números -6, 0 e 5. Nenhuma dessas cinco execuções comprova passagem pelo webhook, tratamento de erro do cálculo, classificação, Gemini, persistência ou decisão da gerente.

As instruções gerais de Run once acima descrevem homologação futura: **não executar o cenário atual pelo webhook enquanto os três registros pendentes estiverem protegidos**. Usar execução de módulo isolado ou cenário de homologação sem webhook e sem módulos de escrita.

## Plano integrado complementar

1. Encadear fixtures → cálculo → normalização → classificação → preparação Gemini em cenário separado, sem conexão de escrita. Comparar fórmulas com os módulos atuais.
2. Cobrir dias -6, 0, 1, 5, 7, 8, 15 e 16, estoque zero e cada campo obrigatório ausente/defeituoso separadamente. Verificar tipos numéricos, nulls e preservação de campos desconhecidos.
3. Forçar erro de parseDate; comprovar Resume com diasRestantes null, continuação do próximo item e bloqueio da elegibilidade. Um Success isolado não comprova esses três efeitos.
4. Conferir arredondamento do piso: original 20,01 com mínimo zero exige 6,01; 6,00 é inválido. Mínimo comercial superior prevalece.
5. Validar JSON gerado para Gemini, inclusive aspas no nome, números decimais, dia zero, histórico e unidade desconhecidos como null. Não confundir preparação com chamada real ao provedor.
6. Após configurar Gemini e armazenamento aprovado, executar CT-06–10, 12–16 e 20–24 com sugestões e decisões controladas em homologação; conferir preço e histórico antes/depois. Sem fonte aprovada, não inserir registros fictícios na planilha real.

Registrar novas execuções em relatório separado, com entrada, saída copiada do Make e distinção entre teste isolado, integração entre módulos e integração externa.
