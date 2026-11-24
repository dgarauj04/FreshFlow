# Estrutura proposta — Google Sheets

> Auditoria de 23/11/2026: a origem real possui Produtos, Descarte e Movimentacao. A usuária autorizou id existente → productId e escolheu Gemini. Esta proposta completa continua sujeita ao Tech Lead. Campos usados no núcleo, ausências e limites para escrita: [implementação](implementacao-make.md). Nenhuma estrutura foi alterada.

**Estado:** contrato para aprovação do Tech Lead; planilha ainda não criada por esta entrega. Três abas: `Produtos`, `SugestoesIA` e `Movimentacoes`. Escopo: loja piloto única do README.

## Convenções e identificação

- Cabeçalho na primeira linha, nomes exatamente como abaixo, sem células mescladas ou linhas vazias no meio dos registros. IDs são texto. Linha física não é identificador: localizar por chave antes de atualizar.
- Datas civis: texto ISO `YYYY-MM-DD`, validado como data real. Instantes: texto ISO 8601 em UTC (`...Z`). Fuso operacional proposto: `America/Sao_Paulo`, a confirmar pelo Tech Lead.
- Preços: números em BRL, até duas casas; escrever como número sem `R$`. Calcular limites em centavos. Quantidades: números não negativos na unidade do produto; precisão de kg/unidades a confirmar. JSON é texto serializado, sem fórmulas. Usar entrada literal/RAW nos campos textuais para evitar interpretação como fórmula.
- Vazio em coluna opcional significa ausente. Não usar zero para representar histórico desconhecido, preço ausente ou data não informada. Campos obrigatórios inválidos bloqueiam o grupo.

**Uma linha de Produtos corresponde a produto + data de validade**, independentemente de lote. `productId` identifica o produto de catálogo; `groupKey` identifica o grupo operacional. Proposta de codificação sem colisão de separadores: JSON compacto do par, por exemplo `["PAD-001","2026-11-24"]`.

Mesmo produto com duas validades gera duas linhas, duas chaves e sugestões independentes. Mesmo produto e validade com lotes diferentes gera uma linha com saldo consolidado; os lotes podem constar em `lotes`, sem entrar na chave. A ausência de lote é válida. Não consolidar produtos diferentes apenas porque têm nomes parecidos.

**Pendência Tech Lead:** validar se o atual `id` dos mocks representa SKU ou registro operacional e fornecer o mapeamento para `productId`. Não assumir que IDs criados ao cadastrar novos lotes são automaticamente o mesmo produto. Consolidar somente registros com o mesmo produto, validade, unidade e preços compatíveis; divergência de preço original/atual/mínimo precisa de saneamento e decisão, nunca média arbitrária.

## Aba Produtos

| Coluna | Tipo | Obrigatória | Finalidade/regra |
|---|---|---|---|
| groupKey | texto único | sim | Chave primária derivada do par produto + validade. |
| productId | texto | sim | Identidade estável do produto; repete em validades diferentes. |
| nome | texto | sim | Nome real cadastrado, enviado à IA. |
| categoria | enum texto | sim | `Padaria`, `Frios e Laticínios` ou `Hortifrúti`, conforme README. |
| marca | texto | não | Informação cadastral existente, quando disponível. |
| dataValidade | data ISO | sim | Parte da chave; alteração exige migração das referências, não edição silenciosa. |
| lotes | texto JSON de array de strings | não | Referências opcionais; ex.: `["LOTE-A","LOTE-B"]`. Vazio ou `[]` não altera a chave. |
| unidade | texto | sim | Unidade das quantidades e do preço, como `un` ou `kg`; mapeamento a confirmar. |
| quantidadeEmExposicao | número >= 0 | sim | Saldo ainda em exposição. |
| quantidadeNoSelfService | número >= 0 | sim | Saldo transferido e ainda não utilizado; não recuperado. |
| precoOriginal | número > 0 | sim | Base do teto comercial de desconto. |
| precoAtual | número > 0 | sim | Preço vigente; não muda ao gerar sugestão. |
| precoMinimo | número >= 0 | sim | Limite comercial informado pela equipe; ausência não vira zero. |
| versao | inteiro >= 1 | sim | Revisão incrementada em toda mudança relevante de saldo, preço ou cadastro pelo escritor autorizado. |
| atualizadoEm | instante ISO | sim | Última atualização confirmada. |

`quantidadeDisponivel = quantidadeEmExposicao + quantidadeNoSelfService` é derivada, como no código atual; não manter outro saldo editável. O envio desse total para análise de preço precisa de confirmação da PO para itens destinados ao self-service. Não armazenar `diasRestantes` como verdade permanente: recalcular a cada execução e decisão.

Não somar contadores históricos dos mocks com novas movimentações que representem os mesmos fatos. Ao migrar, escolher com o Tech Lead uma data de corte/saldo inicial e importar o histórico sem duplicá-lo. Cadastro e movimentação física não constituem um terceiro cenário implementado nesta entrega.

## Aba SugestoesIA

| Coluna | Tipo | Obrigatória | Finalidade/regra |
|---|---|---|---|
| suggestionId | texto único | sim | Chave primária gerada pelo Make, nunca pela IA. |
| requestId | texto | sim | Solicitação que originou o registro; único em conjunto com `groupKey`. |
| groupKey | texto | sim | FK lógica para Produtos. |
| productId | texto | sim | Cópia de conferência do produto do grupo. |
| dataValidade | data ISO | sim | Cópia de conferência; permite distinguir validades do mesmo produto. |
| versaoProduto | inteiro | sim | Revisão lida ao analisar; base para detectar sugestão desatualizada. |
| snapshotEntrada | texto JSON | sim | Dados enviados: nome, categoria, validade, dias, saldo, preços e histórico ou `null`. |
| suggestedPrice | número > 0 | sim | Preço sugerido validado; duas casas. |
| discountPercent | número de 0 a 70 | sim | Percentual recalculado pelo Make sobre o preço original. |
| reason | texto | sim | Justificativa objetiva, sem promessas de venda. |
| urgency | enum texto | sim | `VENCE_HOJE`, `PROXIMO_DO_VENCIMENTO`, `ATENCAO`, `NORMAL`; conforme dias e política aprovada. |
| status | enum texto | sim | `PENDING`, `APPROVED`, `REJECTED`; extensão técnica proposta: `INVALIDATED`. |
| criadoEm | instante ISO | sim | Criação da pendência. |
| provedor | enum texto | sim | `OPENAI` ou `GEMINI`, realmente utilizado. |
| modelo | texto | sim | Identificador do modelo efetivamente configurado; não inventar nome. |
| versaoPrompt | texto | sim | Proposta inicial: `freshflow-precos-v1`. |
| decisionId | texto | após decisão | Relaciona a decisão ao evento de histórico. |
| acaoDecisao | enum texto | após decisão | `ACEITAR`, `REJEITAR` ou `PERSONALIZAR`. |
| precoFinal | número > 0 | após decisão | Preço aplicado ou preço mantido na rejeição. |
| decididoPor | texto | após decisão | Responsável identificado pelo mecanismo aprovado. |
| decididoEm | instante ISO | após decisão | Momento da decisão confirmada. |
| motivoInvalidacao | texto | se invalidada | Alteração de versão, vencimento ou esgotamento detectado. |

`PENDING → APPROVED` (aceitar/personalizar) ou `PENDING → REJECTED` (rejeitar). Proposta técnica: `PENDING → INVALIDATED` quando a condição de origem perdeu validade; preservar a linha e seu motivo. Não reabrir ou apagar estados finais. Aprovação parcial em falha técnica é sinalizada pelo evento `PREPARED` relacionado; não exibir como operação concluída até reconciliação.

No máximo uma pendência por `groupKey`. `NO_SUGGESTION` é resultado de análise sem preço, não linha pendente nesta aba; erros e resultados sem recomendação ficam na resposta e nos registros de execução do Make. Retenção/persistência desses resultados para repetição integral de uma análise é decisão do Tech Lead; as sugestões já gravadas são sempre reutilizadas por `requestId + groupKey`.

## Aba Movimentacoes

Histórico de decisões de preço e fatos operacionais. As linhas de decisões não movimentam estoque. As linhas físicas só são inseridas pelo fluxo autorizado de registro de movimentações, fora dos dois cenários de preço descritos aqui.

| Coluna | Tipo | Obrigatória | Finalidade/regra |
|---|---|---|---|
| movementId | texto único | sim | Chave primária; evento preservado para auditoria. |
| decisionId | texto | para decisão | Único por decisão; repetição não cria outro evento. |
| requestId | texto | quando houver | Correlação com solicitação de origem. |
| suggestionId | texto | para decisão | FK lógica para SugestoesIA. |
| groupKey | texto | sim | FK lógica para Produtos. |
| productId | texto | sim | Conferência de identidade. |
| dataValidade | data ISO | sim | Conferência do grupo. |
| lote | texto | não | Referência informativa de rastreabilidade. |
| tipo | enum texto | sim | Tipos descritos abaixo. |
| quantidade | número >= 0 | sim | Quantidade física; **zero para decisões de preço**. |
| origem | enum texto | para fato físico | `EXPOSICAO` ou `SELF_SERVICE`; determina qual saldo pode baixar. |
| destino | texto | para fato físico | Destino registrado da transferência/saída. |
| precoOriginal | número > 0 | sim | Snapshot da base de preço no momento do fato. |
| precoAnterior | número > 0 | para decisão | Preço antes da decisão. |
| precoSugerido | número > 0 | para decisão | Valor original da recomendação, inclusive quando rejeitada/personalizada. |
| precoFinal | número > 0 | para decisão | Preço aplicado ou mantido. |
| precoUnitario | número >= 0 | para fato físico | Valor registrado do fato; receita somente se houve venda. |
| acaoDecisao | enum texto | para decisão | `ACEITAR`, `REJEITAR` ou `PERSONALIZAR`. |
| responsavel | texto | sim | Responsável pelo registro. |
| dataHora | instante ISO | sim | Momento do evento. |
| estadoRegistro | enum texto | sim | Proposta: `PREPARED` ou `COMMITTED`; somente confirmado entra em indicadores/histórico de vendas. |
| observacoes | texto | não | Motivo e contexto sem credenciais/dados desnecessários. |

Tipos compatíveis com o vocabulário existente: `preco_alterado_ia`, `sugestao_rejeitada`, `preco_personalizado`, `venda_normal`, `venda_promocional`, `doacao`, `transferencia_self_service`, `utilizacao_self_service` e `descarte`. Aprovar a convenção final com o Tech Lead. O estado técnico do evento não é o status da sugestão.

### Transferência e aproveitamento

| Tipo de fato confirmado | Efeito no saldo | Recuperação efetiva |
|---|---|---|
| transferencia_self_service | Diminui exposição, aumenta self-service na mesma quantidade; total igual | Não |
| utilizacao_self_service | Diminui saldo de self-service | Sim, somente utilização efetivamente registrada |
| venda_normal / venda_promocional | Diminui saldo da origem informada | Sim |
| doacao | Diminui saldo da origem informada | Sim |
| descarte | Diminui saldo da origem informada | Não; perda |
| Decisão de preço | Nenhum | Não |

Uma mesma unidade transferida e depois utilizada conta uma única vez, na utilização. Não inferir receita monetária de doação/utilização; eventual valorização de desperdício evitado é indicador distinto e depende da PO. Quantidades de unidades diferentes não são somadas sem critério de conversão aprovado.

## Relacionamentos e validação

`Produtos.groupKey 1 → N SugestoesIA.groupKey` e `Produtos.groupKey 1 → N Movimentacoes.groupKey`. Cada sugestão tem no máximo uma decisão final confirmada; `Movimentacoes.suggestionId` referencia essa sugestão nas decisões. Produto + validade copiados devem corresponder à chave. Sheets não impõe PK, FK ou unicidade: o Make precisa validá-las.

Não excluir produto que tenha histórico; validade corrigida exige migração rastreável. Não usar `lotId` obrigatório no prompt/decisão. A correlação de cada chamada de IA preserva o grupo fora dos seis campos de saída, pois só `productId` não distingue as validades.

## Aprovação necessária do Tech Lead

1. Mapeamento de IDs existentes para produto de catálogo; formato da chave, consolidação de lotes, unidade e precisão de quantidades.
2. Nomes e tipos das colunas, estados `INVALIDATED` e `PREPARED/COMMITTED`, versionamento e migração do histórico inicial.
3. Garantias de unicidade, controle entre cenários/edição manual e reconciliação de escrita parcial; número de linha não serve como chave estável.
4. Contratos e tradução futura para campos atuais do React (`id`, `precoSugerido`, `descontoPercentual`, `justificativa`); nenhuma alteração de aplicação nesta etapa.
5. Acesso à planilha, conexões reais, tratamento de entrada literal, cobertura/retenção do histórico e registros do Make. Com a PO: políticas comerciais e indicadores, detalhados na [arquitetura](arquitetura-make.md).
