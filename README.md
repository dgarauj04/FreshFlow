<div align="center">

# 🌿 FreshFlow

### *Inteligência que movimenta, tecnologia que evita desperdícios.*

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Make.com](https://img.shields.io/badge/Make.com-Automation-9B59B6?style=flat-square)](https://www.make.com/)
[![Google Sheets](https://img.shields.io/badge/Google%20Sheets-Data-34A853?style=flat-square&logo=google-sheets)](https://sheets.google.com/)
[![Gemini API](https://img.shields.io/badge/Gemini%20API-AI-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)

> **Desafio 04 — KODIE Academy** · Briefing: Carrefort Supermercados

</div>

---

## 📋 Índice

- [O Problema](#-o-problema)
- [A Persona](#-a-persona)
- [A Solução](#-a-solução)
- [O que a IA Entregou](#-o-que-a-ia-entregou)
- [O que Criamos](#-o-que-criamos)
- [Prompt Mestre](#-prompt-mestre)
- [Stack Tecnológica](#-stack-tecnológica)
- [Arquitetura](#-arquitetura)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Executar](#-como-executar)
- [Time](#-time)

---

## 🚨 O Problema

A rede **Carrefort** possui **40 lojas** e enfrenta perdas expressivas de produtos perecíveis devido à ausência de um sistema eficiente de monitoramento de validade.

| Situação Atual | Impacto |
|---|---|
| Controle feito manualmente com planilhas impressas | Alto risco de erro humano e retrabalho |
| Sem sistema de alerta de vencimento | Produtos expiram sem ação preventiva |
| Sem rastreabilidade de movimentações | Impossível medir desperdício real |
| Operação com estoque enxuto | Gôndolas = estoque → qualquer perda é crítica |
| Sem suporte à decisão de preço | Precificação promocional é manual e tardia |

> A operação trabalha com estoque enxuto, onde o próprio salão de vendas e as gôndolas funcionam como área de armazenamento e exposição, sem necessidade de um armazém separado.

---

## 👩 A Persona

<div align="center">

### Dona Célia — Gerente de Setor

</div>

Dona Célia é a responsável pelo setor de perecíveis. Ela não tem tempo para sistemas complexos e precisa tomar decisões rápidas durante a operação do dia a dia.

**Ela precisa:**
- 📦 Acompanhar produtos e lotes em exposição
- ⏰ Identificar produtos próximos do vencimento
- 🔝 Visualizar prioridades de acordo com a validade (FEFO)
- 🤖 Receber sugestões inteligentes de preços promocionais
- ✅ Aprovar, rejeitar ou personalizar ofertas sugeridas pela IA
- 📝 Registrar o destino dos produtos (venda, doação, descarte, self-service)
- 📊 Acompanhar indicadores de desperdício evitado

---

## 💡 A Solução

**FreshFlow** é uma aplicação web administrativa que transforma informações de produtos, lotes, estoque e validade em **decisões operacionais rápidas**.

O sistema responde à pergunta central:

> **💬 "Quanto desperdício de alimentos foi evitado nesta loja durante a semana?"**

### O ciclo FreshFlow

```
Produto em Exposição
        ↓
   Monitoramento
   (automático via Make)
        ↓
     Alerta
   (classificação FEFO)
        ↓
  Sugestão Inteligente
   (IA via Gemini/OpenAI)
        ↓
  Aprovação da Gerente
   (Aceitar / Rejeitar / Personalizar)
        ↓
   Movimentação
   (Venda / Doação / Self-service / Descarte)
        ↓
   Aproveitamento
   (Registro auditável)
        ↓
   Indicadores
   (Dashboard em tempo real)
```

### Classificação de Validade

| Status | Regra | Visual |
|---|---|---|
| 🔴 VENCIDO | Menos de 0 dias | Vermelho |
| 🔴 VENCE HOJE | 0 dias | Vermelho |
| 🟠 PRÓXIMO DO VENCIMENTO | 1 a 7 dias | Laranja |
| 🟡 ATENÇÃO | 8 a 15 dias | Amarelo |
| 🟢 NORMAL | Mais de 15 dias | Verde |

---

## 🤖 O que a IA Entregou

A inteligência artificial foi utilizada em três frentes dentro do FreshFlow:

### 1. Estruturação do Prompt Mestre
A IA auxiliou na construção e refinamento do **Prompt Mestre V1.0** — documento que define toda a identidade do projeto: regras de negócio, arquitetura, escopo, metodologia de desenvolvimento e critérios de aceitação do MVP.

### 2. Sugestões Inteligentes de Preço
A IA (Gemini API / OpenAI) analisa cada lote e propõe um preço promocional justificado, respeitando os limites comerciais definidos pela equipe.

**Entrada enviada à IA:**
```json
{
  "productId": "FRI-001",
  "categoria": "Frios e Laticínios",
  "lotId": "LOTE-FRI-001",
  "dataValidade": "2026-11-20",
  "diasRestantes": 2,
  "quantidadeDisponivel": 8,
  "precoOriginal": 24.90,
  "precoAtual": 24.90,
  "precoMinimo": 12.00
}
```

**Resposta estruturada da IA:**
```json
{
  "productId": "FRI-001",
  "lotId": "LOTE-FRI-001",
  "suggestedPrice": 18.00,
  "discountPercent": 28,
  "reason": "Validade próxima e quantidade disponível elevada. Recomenda-se acelerar o giro.",
  "status": "PENDING"
}
```

> ⚠️ A IA **nunca** aplica preços automaticamente. Toda sugestão passa pela aprovação obrigatória da gerente.

### 3. Geração de Código (Assistida)
A IA auxiliou na geração dos componentes React, estrutura de dados mock, regras de negócio centralizadas e integração com Make.com — sempre sob supervisão e aprovação do Tech Lead.

---

## 🛠️ O que Criamos

### MVP Funcional — Loja Piloto 01 (Carrefort)

| Módulo | Descrição |
|---|---|
| 📊 **Dashboard** | Painel gerencial com 13 indicadores dinâmicos, gráficos de desperdício evitado por dia, distribuição por urgência, prévia FEFO e comparativo recuperado vs. descartado |
| 📦 **Gestão de Validades & Lotes** | Tabela FEFO inteligente com filtros por categoria e urgência, busca por produto/marca/lote, cadastro, edição e ações em lote |
| 🤖 **Módulo de IA** | Sugestões de preço com fluxo completo de aprovação, rejeição e personalização pela gerente |
| 📋 **Histórico de Movimentações** | Registro auditável de todas as operações com filtros por período, produto, categoria e tipo |
| 🏪 **Vitrine Última Hora** | Consulta interna de produtos com ofertas aprovadas (apenas para uso interno da gerente) |
| ⚙️ **Automação Make.com** | Monitoramento agendado + integração Google Sheets + motor de IA |

### Dados Demonstrativos
- **51 produtos alimentícios fictícios** organizados em 3 categorias
- 17 produtos de Padaria · 17 de Frios e Laticínios · 17 de Hortifrúti
- Datas variadas cobrindo todos os cenários de validade (vencido → >15 dias)

### Integrações Previstas
- **Google Sheets** → Fonte principal de dados operacionais (3 abas: Produtos, SugestoesIA, Movimentacoes)
- **Make.com** → Orquestrador dos cenários automatizados
- **Gemini API / OpenAI** → Motor de sugestões inteligentes de preço

---

## 📄 Prompt Mestre

O projeto foi construído com auxílio de IA utilizando o **Prompt Mestre V1.0**.

> 📂 O Prompt Mestre completo está em [`docs/prompt-log/prompt-ai-builder.md`](./docs/prompt-log/prompt-ai-builder.md)

**Princípio fundamental:**
> *"A IA acelera a construção do produto, mas as decisões de negócio, validações e aprovações continuam sob responsabilidade da equipe."*

O prompt define, em 22 seções:

| Seção | Conteúdo |
|---|---|
| 1 | Identidade e papel da IA |
| 2 | Contexto do projeto |
| 3 | Objetivo do produto |
| 4 | Escopo do MVP |
| 5 | Tecnologias obrigatórias |
| 6 | Estrutura das telas |
| 7 | Dados demonstrativos |
| 8 | Regras de negócio |
| 9–10 | Automação Make.com e Módulo de aprovação |
| 11–13 | Movimentações, Google Sheets e comunicação React↔Make |
| 14 | Design e UX |
| 15–16 | Arquitetura e segurança |
| 17–18 | Escopo fora do MVP e critérios de aceitação |
| 19–22 | Metodologia, prompt log, regras de conduta e resultado esperado |

---

## 🧰 Stack Tecnológica

### Front-end
| Tecnologia | Uso |
|---|---|
| React 18 | Framework principal (SPA) |
| JavaScript / JSX | Linguagem base |
| CSS Modularizado | Estilização por componente |
| useState / useEffect | Gerenciamento de estado e efeitos colaterais |
| HTML Semântico | Acessibilidade e estrutura |

### Dados & Integração
| Tecnologia | Uso |
|---|---|
| Google Sheets | Fonte principal de dados operacionais |
| Make.com | Automação e integração de serviços |
| Gemini API / OpenAI API | Sugestões inteligentes de preço |
| mock.js | Dados fictícios para demonstração |

---

## 🏗️ Arquitetura

```
React (Front-end SPA)
        ↕ webhook (Make.com)
   Make.com (Orquestrador)
    ↕                   ↕
Google Sheets      Gemini / OpenAI
   (Dados)          (Sugestões IA)
```

---

## 📁 Estrutura do Projeto

```
freshflow/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/            # Sidebar, Header, Layout principal
│   │   ├── dashboard/         # Cards, gráficos e indicadores
│   │   ├── inventory/         # Tabela FEFO, filtros, cadastro de lotes
│   │   ├── offers/            # Vitrine Última Hora
│   │   ├── movements/         # Histórico de movimentações
│   │   └── ai-suggestions/    # Módulo de aprovação da IA
│   ├── data/
│   │   └── mock.js            # 51 produtos demonstrativos
│   ├── services/
│   │   └── api.js             # Camada de integração com Make.com
│   ├── hooks/                 # Custom hooks reutilizáveis
│   ├── utils/                 # Funções utilitárias (validade, FEFO, preços)
│   ├── App.jsx
│   └── main.jsx
├── docs/
│   ├── prompt-log/
│   │   ├── prompt-po.md
│   │   ├── prompt-ux.md
│   │   ├── prompt-tech.md
│   │   ├── prompt-qa.md
│   │   └── prompt-ai-builder.md
│   └── assets/
├── .env.example
└── README.md
```

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/[SEU_REPOSITORIO]/freshflow.git

# Acesse o diretório
cd freshflow

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com as URLs reais dos webhooks

# Execute em modo desenvolvimento
npm run dev
```

### Variáveis de Ambiente

```env
# Make.com Webhooks — URLs serão fornecidas pela equipe
VITE_MAKE_WEBHOOK_URL=http://[SUA_URL_AQUI]
VITE_GOOGLE_SHEETS_URL=http://[SUA_URL_AQUI]
```

> ⚠️ Nunca exponha chaves de API no front-end. As credenciais de IA são gerenciadas pelo Make.com.

---

## 👥 Time

<table>
  <tr>
    <td align="center" width="220">
      <br />
      <b>Emilly</b>
      <br />
      <sub>🔍 QA & Privacidade</sub>
      <br /><br />
      <a href="https://github.com/[GITHUB_EMILLY]">
        <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub" />
      </a>
      &nbsp;
      <a href="https://linkedin.com/in/[LINKEDIN_EMILLY]">
        <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" />
      </a>
      <br /><br />
      <sub>Responsável pelos testes funcionais, validação das regras de negócio e conformidade com boas práticas de privacidade de dados.</sub>
    </td>
    <td align="center" width="220">
      <br />
      <b>Douglas</b>
      <br />
      <sub>🎨 UI/UX Designer & Tech Lead</sub>
      <br /><br />
      <a href="https://github.com/[GITHUB_DOUGLAS]">
        <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub" />
      </a>
      &nbsp;
      <a href="https://linkedin.com/in/[LINKEDIN_DOUGLAS]">
        <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" />
      </a>
      <br /><br />
      <sub>Responsável pela identidade visual, experiência do usuário, arquitetura front-end e decisões técnicas do projeto.</sub>
    </td>
    <td align="center" width="220">
      <br />
      <b>Isabella</b>
      <br />
      <sub>📋 Product Owner</sub>
      <br /><br />
      <a href="https://github.com/[GITHUB_ISABELLA]">
        <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub" />
      </a>
      &nbsp;
      <a href="https://linkedin.com/in/[LINKEDIN_ISABELLA]">
        <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" />
      </a>
      <br /><br />
      <sub>Responsável pela definição do produto, priorização de funcionalidades, validação de requisitos e alinhamento com o cliente.</sub>
    </td>
    <td align="center" width="220">
      <br />
      <b>Vitória</b>
      <br />
      <sub>🤖 AI Builder</sub>
      <br /><br />
      <a href="https://github.com/[GITHUB_VITORIA]">
        <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub" />
      </a>
      &nbsp;
      <a href="https://linkedin.com/in/[LINKEDIN_VITORIA]">
        <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" />
      </a>
      <br /><br />
      <sub>Responsável pela construção e integração das soluções de IA, automações com Make.com e engenharia de prompts.</sub>
    </td>
  </tr>
</table>

> 📌 Substitua os placeholders `[GITHUB_NOME]` e `[LINKEDIN_NOME]` pelos links reais de cada membro.

---

## 📌 Escopo do MVP

### ✅ Incluído nesta versão
- Aplicação web administrativa (uso interno)
- Loja piloto única (Carrefort — Loja 01)
- Dados demonstrativos claramente identificados
- Sugestões de IA com aprovação humana obrigatória
- Integração Google Sheets + Make.com + Gemini/OpenAI

### 🔮 Versões Futuras
- Loja pública para consumidores
- Checkout e pagamentos
- Gestão de múltiplas lojas (40 lojas)
- Login e autenticação real
- Leitura de código de barras
- Integração com sistemas de caixa
- Aplicativo mobile nativo

---

## ✅ Critérios de Aceitação do MVP

- [ ] 51 produtos cadastrados (17 por categoria)
- [ ] Cálculo correto de validade
- [ ] Ordenação FEFO funcionando
- [ ] Filtros operacionais funcionando
- [ ] Produtos vencidos bloqueados para operações
- [ ] Cadastro e edição de lotes
- [ ] Movimentações atualizando o estoque
- [ ] Vitrine interna com apenas ofertas válidas
- [ ] IA gerando sugestões via Make
- [ ] Gerente pode aceitar, rejeitar e personalizar preços
- [ ] Google Sheets recebendo atualizações
- [ ] Histórico registrando todas as operações
- [ ] Indicadores calculados a partir das movimentações
- [ ] Erros de integração tratados com feedback visual
- [ ] Responsivo para desktop, notebook, tablet e celular

---

<div align="center">

**FreshFlow** · Desafio 04 — KODIE Academy · Briefing Carrefort Supermercados

*Desenvolvido com 💚 pelo Time FreshFlow*

</div>
