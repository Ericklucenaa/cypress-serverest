# Cypress + ServeRest — testes E2E e de API

[![Testes automatizados](https://github.com/Ericklucenaa/cypress-serverest/actions/workflows/ci.yml/badge.svg)](https://github.com/Ericklucenaa/cypress-serverest/actions/workflows/ci.yml)
![Cypress](https://img.shields.io/badge/Cypress-16-17202C?logo=cypress)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)

Projeto de automação de testes da aplicação **[ServeRest](https://serverest.dev)**: uma loja virtual com
API REST e front-end em React, feita para estudo de testes. São **27 testes**, divididos em **API**
(contrato, regras de negócio e erros) e **interface** (fluxos completos do usuário no navegador).

📊 **Relatório da última execução:** https://ericklucenaa.github.io/cypress-serverest/

---

## O que é testado

| Área                      | Cenários                                                                                                       |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **API – Usuários**        | cadastro e consulta por id · filtro por e-mail · e-mail duplicado · campos obrigatórios · alteração · exclusão |
| **API – Login**           | login válido com token JWT · senha incorreta · e-mail inexistente · campos obrigatórios                        |
| **API – Produtos**        | cadastro por administrador · sem token (401) · usuário comum (403) · nome duplicado · exclusão                 |
| **UI – Login**            | administrador → painel · usuário → loja · senha incorreta · servidor fora do ar (resposta simulada)            |
| **UI – Cadastro**         | usuário comum · administrador · e-mail já em uso                                                               |
| **UI – Produtos (admin)** | cadastro pela tela aparece na listagem · listagem de produto criado via API                                    |
| **UI – Loja**             | pesquisa e lista de compras · alterar quantidade · limpar lista · vitrine com dados simulados                  |

## Decisões técnicas

- **Massa de dados via API, verificação via tela.** Os testes de interface criam usuários e produtos
  direto na API (`cy.criarUsuario`, `cy.criarProduto`) e só usam o navegador para o que estão testando.
  Isso deixa os testes rápidos e independentes entre si: qualquer um roda sozinho, em qualquer ordem.
- **Dados únicos e limpeza automática.** Cada execução gera dados novos com
  [Faker](https://fakerjs.dev) (pt-BR) e apaga tudo o que criou ao final de cada spec, porque a API é
  pública e compartilhada.
- **Testes de contrato.** As respostas da API são validadas contra JSON Schemas
  ([`cypress/fixtures/schemas`](cypress/fixtures/schemas)) com [Ajv](https://ajv.js.org): uma mudança de
  formato na API quebra o teste mesmo que o status continue 200.
- **`cy.intercept` para observar e simular a rede.** Os testes conferem o que a tela enviou ao
  servidor, simulam erro 500 no login e substituem a listagem de produtos por uma fixture para testar
  a renderização de forma determinística.
- **Page Objects enxutos** ([`cypress/support/pages`](cypress/support/pages)) e seletores
  `data-testid`, sem `cy.wait(ms)` fixos (proibidos pelo lint).
- **TypeScript estrito + ESLint + Prettier**, validados no CI antes de rodar os testes.

## Estrutura

```
cypress/
├── e2e/
│   ├── api/                 # login, usuários, produtos
│   └── ui/                  # login, cadastro, produtos (admin), loja e lista de compras
├── fixtures/
│   ├── schemas/             # contratos JSON Schema
│   └── produtos-mock.json   # resposta simulada para cy.intercept
└── support/
    ├── commands.ts          # comandos customizados (API, login, contrato, limpeza)
    ├── factories.ts         # geração de dados com Faker
    └── pages/               # page objects
.github/workflows/ci.yml     # pipeline: lint → testes (API e UI em paralelo) → relatório no Pages
```

## Como executar

Pré-requisito: [Node.js](https://nodejs.org) 22 ou superior.

```bash
npm ci                # instala as dependências
npm run cy:open       # modo interativo (escolha os testes na interface do Cypress)
npm test              # todos os testes em modo headless
npm run test:api      # só API
npm run test:ui       # só interface
npm run lint          # ESLint + checagem de tipos
```

Depois de `npm test`, o relatório HTML fica em `cypress/reports/index.html`.

> **Rodando pelo terminal do VS Code e o Cypress não abre?** Se aparecer
> `bad option: --smoke-test`, o terminal está com a variável `ELECTRON_RUN_AS_NODE=1`, que o
> VS Code define. Rode em outro terminal ou limpe a variável antes (`set ELECTRON_RUN_AS_NODE=` no
> cmd, `$env:ELECTRON_RUN_AS_NODE=$null` no PowerShell).

## Integração contínua

O workflow [`ci.yml`](.github/workflows/ci.yml) roda a cada push e pull request, e também em dias
úteis às 9h, para detectar mudanças na aplicação mesmo sem commits:

1. **Lint e tipos**: ESLint, `tsc --noEmit` e Prettier.
2. **Cypress**: as suítes de API e UI rodam em paralelo no Chrome, com até 2 novas tentativas em caso
   de instabilidade da rede. Relatórios e screenshots das falhas ficam como artefatos da execução.
3. **Relatório**: na branch `main`, os relatórios são publicados no GitHub Pages.

---

Feito por **Erick Henrique** · [GitHub](https://github.com/Ericklucenaa)
