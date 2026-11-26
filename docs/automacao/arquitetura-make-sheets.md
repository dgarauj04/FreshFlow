# Arquitetura de Automação e Dados — Make.com & Google Sheets

## 1. Visão Geral da Arquitetura

O **FreshFlow** utiliza o **Make.com** como camada de orquestração entre a interface administrativa (React), o armazenamento estruturado (**Google Sheets**) e o motor de inteligência artificial (**Google Gemini AI**).

A IA atua exclusivamente como **assistente de recomendação** (`status: PENDING`). Nenhuma alteração de preço ou baixa de estoque ocorre sem ação explícita da gerente de setor (Dona Célia).

```text
[React Admin] ──(1. Solicita análise)──> [Make: analisar_estoque] ──> [Google Sheets: Produtos]
                                                   │
                                        (2. Valida regras FEFO)
                                                   │
                                                   ▼
                                          [Google Gemini AI]
                                                   │
                                        (3. Grava sugestão PENDING)
                                                   ▼
[React Admin] <──(4. Exibe sugestões)─── [Google Sheets: SugestoesIA]
      │
(5. Gerente: Aceitar / Personalizar / Rejeitar)
      │
      ▼
[Make: decisao_preco] ──> Atualiza [Produtos], [SugestoesIA] e registra auditoria em [Movimentacoes]
```

---

## 2. Estrutura de Dados (Google Sheets)

A planilha operacional é composta por três abas principais. As datas civis seguem o padrão ISO `YYYY-MM-DD` (fuso `America/Sao_Paulo`) e os valores monetários são armazenados como números decimais em BRL.

### 2.1 Aba `Produtos`
Cada linha representa um grupo operacional único identificado pela chave composta **`productId` + `dataValidade`** (`groupKey`, ex.: `["PAD-001","2026-11-24"]`).

| Coluna | Tipo | Obrigatória | Descrição |
| :--- | :--- | :---: | :--- |
| `groupKey` | Texto único | Sim | Chave única derivada de `productId` + `dataValidade`. |
| `productId` | Texto | Sim | Identificador estável do produto no catálogo (ex.: `PAD-001`). |
| `nome` | Texto | Sim | Nome do produto exibido na interface e enviado à IA. |
| `categoria` | Enum | Sim | `Padaria`, `Frios e Laticínios` ou `Hortifrúti`. |
| `marca` | Texto | Não | Fabricante ou marca própria. |
| `dataValidade` | Data ISO | Sim | Data de vencimento do lote/grupo (`YYYY-MM-DD`). |
| `lotes` | JSON Array | Não | Lista opcional de rastreabilidade (ex.: `["LOTE-PAD-001"]`). |
| `unidade` | Texto | Sim | Unidade de medida (`un`, `kg`, `g`). |
| `quantidadeEmExposicao` | Número >= 0 | Sim | Saldo disponível na área de vendas. |
| `quantidadeNoSelfService` | Número >= 0 | Sim | Saldo transferido para consumo interno/self-service. |
| `precoOriginal` | Número > 0 | Sim | Preço base utilizado para cálculo de desconto. |
| `precoAtual` | Número > 0 | Sim | Preço vigente em gôndola. |
| `precoMinimo` | Número >= 0 | Sim | Piso comercial permitido para o produto. |
| `versao` | Inteiro >= 1 | Sim | Controle de revisão incrementado a cada alteração de saldo ou preço. |
| `atualizadoEm` | Timestamp ISO | Sim | Data e hora da última atualização. |

### 2.2 Aba `SugestoesIA`
Armazena as recomendações geradas pelo Gemini e o histórico de aprovação. Existe no máximo uma sugestão `PENDING` ativa por `groupKey`.

| Coluna | Tipo | Obrigatória | Descrição |
| :--- | :--- | :---: | :--- |
| `suggestionId` | Texto único | Sim | ID único da sugestão gerado pelo Make. |
| `requestId` | Texto | Sim | ID da execução que originou a análise. |
| `groupKey` | Texto (FK) | Sim | Referência ao grupo em `Produtos`. |
| `productId` | Texto | Sim | Código do produto para conferência. |
| `dataValidade` | Data ISO | Sim | Validade do grupo analisado. |
| `versaoProduto` | Inteiro | Sim | Versão do produto no momento da análise (evita aplicar preço em saldo desatualizado). |
| `suggestedPrice` | Número > 0 | Sim | Preço promocional sugerido pela IA. |
| `discountPercent` | Número (0–70) | Sim | Percentual de desconto calculado sobre `precoOriginal`. |
| `reason` | Texto | Sim | Justificativa objetiva gerada pela IA. |
| `urgency` | Enum | Sim | `VENCE_HOJE`, `PROXIMO_DO_VENCIMENTO`, `ATENCAO` ou `NORMAL`. |
| `status` | Enum | Sim | `PENDING`, `APPROVED`, `REJECTED` ou `INVALIDATED`. |
| `provedor` / `modelo` | Texto | Sim | Provedor utilizado (`GEMINI`) e identificador do modelo. |
| `decisionId` | Texto | Pós-decisão | Correlação com o registro na aba `Movimentacoes`. |
| `acaoDecisao` | Enum | Pós-decisão | `ACEITAR`, `REJEITAR` ou `PERSONALIZAR`. |
| `precoFinal` | Número > 0 | Pós-decisão | Preço efetivamente aplicado ou mantido. |
| `decididoPor` | Texto | Pós-decisão | Operador responsável pela decisão (ex.: `Dona Célia`). |
| `decididoEm` | Timestamp ISO | Pós-decisão | Data/hora da decisão. |

### 2.3 Aba `Movimentacoes`
Trilha de auditoria imutável para decisões de preço e movimentações físicas de estoque.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `movementId` | Texto (PK) | Identificador único do evento de auditoria. |
| `decisionId` | Texto | Chave de idempotência para evitar duplicidade em retentativas de decisão. |
| `suggestionId` | Texto (FK) | Referência à sugestão avaliada (quando aplicável). |
| `groupKey` / `productId` | Texto | Identificação do produto e grupo afetado. |
| `tipo` | Enum | `preco_alterado_ia`, `preco_personalizado`, `sugestao_rejeitada`, `venda_normal`, `venda_promocional`, `transferencia_self_service`, `utilizacao_self_service`, `doacao` ou `descarte`. |
| `quantidade` | Número >= 0 | Quantidade movimentada (`0` para eventos apenas de alteração de preço). |
| `precoAnterior` / `precoFinal` | Número > 0 | Histórico de valores antes e depois da ação. |
| `responsavel` | Texto | Usuário que executou a ação. |
| `dataHora` | Timestamp ISO | Momento exato do registro. |

---

## 3. Regras de Negócio e Validações Determinísticas

Antes de acionar a IA ou persistir qualquer alteração, o Make aplica validações determinísticas:

1. **Cálculo de Validade e Elegibilidade (FEFO):**
   * `diasRestantes = dataValidade - dataReferencia` (cálculo por data civil, ignorando horas).
   * **< 0 dias (`VENCIDO`):** Bloqueado para venda e para sugestões de IA. Permite apenas descarte.
   * **0 a 7 dias (`VENCE_HOJE` / `PROXIMO_DO_VENCIMENTO`):** Elegível para análise de preço pela IA (desde que possua saldo > 0 e não tenha sugestão `PENDING` ativa).
   * **8 a 15 dias (`ATENCAO`) e > 15 dias (`NORMAL`):** Fora da janela de desconto automático.
2. **Limites Comerciais de Precificação:**
   * Desconto máximo permitido: **70%** sobre o `precoOriginal` (teto de segurança).
   * Piso de preço calculado em centavos: `limiteInferior = max(precoMinimo, ceil(precoOriginal * 0.30))`.
   * Qualquer sugestão da IA ou preço personalizado abaixo do `limiteInferior` ou acima do `precoOriginal` é recusado.
3. **Regras de Estoque e Indicadores:**
   * Decisões de preço (`ACEITAR`, `REJEITAR`, `PERSONALIZAR`) **não alteram o saldo** do produto.
   * `transferencia_self_service` apenas move saldo da exposição para o self-service; a unidade só entra no KPI **Alimentos Recuperados** quando ocorre venda (`venda_normal`/`venda_promocional`), `doacao` ou `utilizacao_self_service`.
   * Itens registrados como `descarte` são contabilizados exclusivamente como perda.

---

## 4. Contratos de Webhook (Make.com)

### Cenário 1: `analisar_estoque`
* **Entrada (POST JSON):**
  ```json
  {
    "requestId": "REQ-20261124-001",
    "productIds": ["PAD-001"]
  }
  ```
  *(Nota: `productIds` é opcional; se omitido, analisa todos os produtos elegíveis da loja).*
* **Fluxo interno:** Recebe webhook → lê `Produtos` → normaliza números/datas e calcula `diasRestantes` → filtra itens elegíveis sem pendência ativa → envia payload ao Gemini → valida JSON de retorno → grava em `SugestoesIA` como `PENDING` → retorna JSON consolidado.

### Cenário 2: `decisao_preco`
* **Entrada (POST JSON):**
  ```json
  {
    "decisionId": "DEC-20261124-001",
    "suggestionId": "SUG-20261124-001",
    "action": "PERSONALIZAR",
    "customPrice": 15.00,
    "decididoPor": "Dona Célia"
  }
  ```
  *(Nota: `action` aceita `ACEITAR`, `REJEITAR` ou `PERSONALIZAR`; `customPrice` é obrigatório apenas quando `action = PERSONALIZAR`).*

---

## 5. Status Atual da Implementação e Próximos Passos

### Concluído (Núcleo Lógico no Make)
* **Cenário Principal (`5062742`):** Estrutura de recebimento, leitura, tratamento de erros (`Resume`), normalização de moeda/datas BRL, classificação FEFO e montagem do payload para o Gemini configurados.
* **Cenário de Homologação (`5063220`) e Rascunho de Decisão (`5063231`):** Fluxos de validação de regras comerciais e limites de desconto testados com dados controlados (fixtures).

### Pendências para Integração Final (Tech Lead & AI Builder)
* [ ] Criar as abas `SugestoesIA` e `Movimentacoes` na planilha oficial do Google Sheets conforme o schema da Seção 2.
* [ ] Configurar a credencial/conexão ativa do **Google Gemini AI** no Make e ativar os módulos de escrita (`Add a Row` / `Update a Row`).
* [ ] Conectar as URLs dos webhooks gerados no Make às chamadas de serviço do Front-end React (`src/services/api.js`) e validar o alinhamento das faixas de urgência entre UI e automação com a PO.