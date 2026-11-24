# Regras determinísticas e validações — FreshFlow

**Estado:** especificação documental. As regras comerciais solicitadas são obrigatórias; detalhes de implementação são propostas sujeitas ao Tech Lead. Divergências do material atual estão explicitadas, sem alteração de código.

## 1. Data de referência, validade e elegibilidade

Validar `dataValidade` como uma data civil real em `YYYY-MM-DD` (não normalizar silenciosamente 31/02). Proposta: usar a data atual da loja em `America/Sao_Paulo`, capturada uma vez por análise; ao decidir, capturar novamente. Converter os componentes ano/mês/dia das duas datas em ordinais de calendário e subtrair:

```text
diasRestantes = ordinal(dataValidade) - ordinal(dataReferencia)
```

Não dividir diferenças entre instantes locais por 24 horas; horário do clique não deve alterar o número de dias. A IA recebe o resultado e não o recalcula. Data fixa `2026-11-17` de `src/utils/rules.js` pertence à demonstração; não deve virar o relógio da automação real. Nos testes, fixar explicitamente a referência.

Classificação de referência do README:

| Dias restantes | Urgência no contrato | Efeito |
|---|---|---|
| < 0 | VENCIDO | Sem sugestão/aplicação de preço; operações físicas somente de descarte. |
| 0 | VENCE_HOJE | Prioridade crítica; não equivale a vencido. Política de IA hoje depende de conciliação PO/Tech Lead. |
| 1 a 7 | PROXIMO_DO_VENCIMENTO | Candidato à análise se houver saldo e dados válidos; amanhã é prioridade crítica. |
| 8 a 15 | ATENCAO | Monitorar; fora da janela de análise de até 7 dias atualmente usada no hook. |
| > 15 | NORMAL | Fora da janela; sem sugestão nessa execução. |

O código de urgência da interface distingue amanhã, 2 dias, 3–5 e >5; isso difere do README. Para esta proposta, conservar a tabela documental acima no contrato da automação e submeter o mapeamento à PO/Tech Lead. A janela até 7 dias é observada em `runAiSimulation`, não uma política nova de descontos. Confirmá-la antes de operação real.

**Caso hoje:** `isActionAllowed` não bloqueia, o hook inclui, mas `requestAiAnalysis` retorna `null` em `days <= 0`. Proposta para homologação: incluir hoje na janela 0–7, alinhada ao README e ao hook. Aprovação da PO/Tech Lead é necessária; não publicar como política já decidida. Falta de aprovação da política impede ativar esse ramo com dados reais, sem reclassificar hoje como vencido.

Elegível no contrato proposto: grupo válido, dias entre 0 e 7 sob política aprovada, quantidade disponível > 0 e nenhuma pendência válida concorrente. Não gerar novamente para grupo já aprovado/rejeitado sem política de reanálise definida pela PO. Itens não elegíveis retornam motivo explícito; não chamar o provedor.

## 2. Preços, desconto máximo de 70% e mínimo

Obrigatórios: `precoOriginal > 0`, `precoAtual > 0` e `0 <= precoMinimo <= precoOriginal`, todos informados e com até duas casas decimais. Preço ausente/inválido bloqueia; não presumir custo, margem ou mínimo zero. Valores não finitos e números em formato ambíguo devem ser recusados antes da IA.

Para uma sugestão ou preço personalizado, em centavos inteiros:

```text
originalCentavos = precoOriginal * 100
minimoCentavos   = precoMinimo * 100
piso70Centavos   = ceil(originalCentavos * 30 / 100)
limiteInferior   = max(minimoCentavos, piso70Centavos) / 100

0 < precoFinal <= precoOriginal
precoFinal >= limiteInferior
descontoExato = 100 * (precoOriginal - precoFinal) / precoOriginal
discountPercent = arredondar(descontoExato, 2)
```

Verificar o limite em centavos **antes** de arredondar o percentual. Ex.: original R$ 20,01 e mínimo R$ 0,00 exigem piso R$ 6,01; R$ 6,00 viola 70%, mesmo que uma exibição arredondada esconda a diferença. Não usar o arredondamento inteiro atual de `validatePromoPrice` como proteção da automação.

Base do desconto: preço original; preço atual é contexto, não uma nova base. Conferir se o percentual retornado é igual ao percentual recalculado com duas casas. Rejeitar divergência, em vez de aceitar preço com percentual incoerente. No registro, persistir o percentual validado pelo Make. Não ajustar automaticamente uma sugestão abaixo do mínimo nem aplicar valor corrigido sem nova aprovação.

Essas verificações se repetem ao **aceitar** ou **personalizar**, usando o cadastro atual. Preço personalizado não é exceção ao teto. A IA não aprova preço e não altera o estoque.

## 3. Estoque não negativo

`quantidadeEmExposicao` e `quantidadeNoSelfService` devem ser números >= 0, na unidade declarada. Total disponível é a soma; total zero impede sugestão e aplicação. Quantidade inválida ou negativa bloqueia o grupo, sem transformar em zero para esconder erro.

Nas movimentações físicas futuras, quantidade deve ser positiva e <= saldo da **origem**. Transferir 5 unidades exige 5 em exposição mesmo se houver outras 20 no self-service. Utilização exige saldo no self-service. Preço aceito/rejeitado/personalizado não baixa estoque. Nunca usar truncamento do saldo para zero para permitir uma saída maior que o disponível.

## 4. Duplicidade, agrupamento e estado desatualizado

- A identidade principal é `productId + dataValidade`, representada por `groupKey`; lote é opcional e não altera essa identidade. Data distinta gera outro grupo.
- Antes de chamar a IA e imediatamente antes de inserir: verificar pendência `PENDING` do grupo. Se válida, retornar a existente. Nunca sobrescrever a pendência a cada clique.
- `requestId + groupKey` impede repetir uma inserção já concluída na mesma análise. Uma repetição pode retomar itens ainda não concluídos, preservando os anteriores.
- Mudança de `versao` desde o snapshot impede aplicar a recomendação. Proposta: invalidar a pendência com motivo e solicitar nova análise em outra requisição. Vencimento ou esgotamento também impedem aplicar. PO define quando reanalisar após rejeição/aprovação; até lá, não gerar automaticamente.
- `decisionId` repetido com o mesmo conteúdo e evento confirmado devolve a decisão anterior; conteúdo diferente é conflito. Outra decisão para sugestão já encerrada também é conflito. Não criar novo evento ou alterar preço novamente.
- Sheets não impõe unicidade. Configurar ordem por cenário, reler antes de escrever e estabelecer exclusão entre escritores com o Tech Lead. Sem essa definição, não declarar prevenção concorrente como garantida. Duplicidade cadastral preexistente é erro de dados, não autorização para duas sugestões.

## 5. Aprovação obrigatória e auditoria

Só o cenário de decisão, após ação explícita da gerente, pode aplicar preço. `status=PENDING` é obrigatório ao criar sugestão válida. Não interpretar JSON da IA ou timeout da interface como aceite.

| Decisão | Preço | Sugestão | Histórico |
|---|---|---|---|
| ACEITAR | Usar preço sugerido persistido, após validar | APPROVED | `preco_alterado_ia` |
| REJEITAR | Manter preço atual | REJECTED | `sugestao_rejeitada` |
| PERSONALIZAR | Usar preço informado e validado | APPROVED + ação PERSONALIZAR | `preco_personalizado` |

Registrar **todas as decisões**, inclusive rejeições e personalizações: IDs, produto + validade, sugestão original, preço anterior/final, ação, responsável e instante. Eventos de preço têm quantidade física zero e impacto de recuperação zero. A aba Movimentacoes guarda as decisões confirmadas; tentativas recusadas/erros devem ficar nos registros de execução do Make com correlação e motivo, sem simular evento comercial concluído. Retenção desses registros deve ser aprovada pelo Tech Lead/QA.

Proposta de consistência: preparar evento `PREPARED`, atualizar os registros necessários, reler e confirmar `COMMITTED`. Falha parcial não é sucesso e exige reconciliação pelo mesmo `decisionId`; não repetir cegamente Add a Row. Não usar dados incompletos para indicadores. Histórico confirmado não deve ser apagado ou sobrescrito; eventual correção exige evento rastreável definido com o Tech Lead.

## 6. Transferência não é aproveitamento efetivo

`transferencia_self_service` somente muda localização; preserva o total disponível. Não contabilizar como unidade recuperada, receita ou desperdício evitado.

`utilizacao_self_service` é um fato posterior e separado: só a utilização confirmada conta como aproveitamento. Venda normal/promocional e doação confirmadas também podem contar como unidades recuperadas, conforme vocabulário atual. Descarte conta como perda. Uma mesma unidade não pode entrar duas vezes por transferência + utilização. Aprovação de oferta também não equivale a venda.

Não somar histórico consolidado inicial com os mesmos eventos detalhados. Métrica monetária de recuperação não é automaticamente receita; fórmula de valorização e conversão entre unidades precisam de decisão da PO.

## 7. Saída da IA e erros

Exigir os seis campos, sem extras, conforme [prompt e schema](prompt-analise-precos.md). `PENDING` exige preço e desconto numéricos; `NO_SUGGESTION` exige ambos nulos. `productId` e `urgency` devem corresponder ao contexto de um único grupo; a validade permanece na correlação externa. Não aceitar `APPROVED` vindo da IA.

Falha do provedor, JSON inválido, campo inventado, preço inválido ou dados alterados entre leitura/escrita produzem erro/bloqueio sem mudar Produtos. Registrar motivo e retornar resultado explícito; não substituir por simulação apresentada como análise real. Detalhes pendentes estão na [arquitetura](arquitetura-make.md).
