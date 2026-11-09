import Ajv from 'ajv'
import { novoProduto, novoUsuario, Produto, Usuario } from './factories'

type Metodo = 'GET' | 'POST' | 'PUT' | 'DELETE'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Requisição para a API do ServeRest sem falhar em status 4xx/5xx (o teste valida o status). */
      apiRequest<T = unknown>(
        method: Metodo,
        path: string,
        body?: object,
        token?: string,
      ): Chainable<Response<T>>
      /** Cria um usuário via API e o registra para limpeza ao final do spec. */
      criarUsuario(usuario?: Usuario): Chainable<{ usuario: Usuario; id: string }>
      /** Faz login via API e devolve o token ("Bearer ..."). */
      loginApi(email: string, password: string): Chainable<string>
      /** Cria um produto via API (precisa de token de administrador) e o registra para limpeza. */
      criarProduto(token: string, produto?: Produto): Chainable<{ produto: Produto; id: string }>
      /** Login direto pelo token (sem passar pela tela), para testes que não são sobre login. */
      logarNaInterface(usuario: Usuario, rota: string): Chainable<void>
      /** Valida o corpo da resposta contra um JSON Schema em fixtures/schemas. */
      validarContrato(schema: string, body: unknown): Chainable<void>
      /** Atalho para [data-testid="..."]. */
      getByTestId(id: string): Chainable<JQuery<HTMLElement>>
      /** Registra um usuário criado pela interface para ser apagado ao final do spec. */
      registrarParaLimpeza(tipo: 'usuario' | 'produto', id: string, token?: string): Chainable<void>
    }
  }
}

const apiUrl = () => Cypress.expose('apiUrl') as string

// ---------- limpeza dos dados criados (a API é pública e compartilhada) ----------
const criados: { tipo: 'usuario' | 'produto'; id: string; token?: string }[] = []

Cypress.Commands.add('registrarParaLimpeza', (tipo, id, token) => {
  criados.push({ tipo, id, token })
})

after(() => {
  // produtos primeiro: o token do administrador precisa existir para apagá-los
  const ordem = [...criados].sort((a, b) => (a.tipo === b.tipo ? 0 : a.tipo === 'produto' ? -1 : 1))
  ordem.forEach(({ tipo, id, token }) => {
    cy.apiRequest(
      'DELETE',
      `/${tipo === 'usuario' ? 'usuarios' : 'produtos'}/${id}`,
      undefined,
      token,
    )
  })
  criados.length = 0
})

// ---------- comandos ----------
Cypress.Commands.add('apiRequest', (method, path, body, token) => {
  return cy.request({
    method,
    url: `${apiUrl()}${path}`,
    body,
    headers: token ? { Authorization: token } : {},
    failOnStatusCode: false,
  })
})

Cypress.Commands.add('criarUsuario', (usuario = novoUsuario()) => {
  return cy.apiRequest<{ _id: string }>('POST', '/usuarios', usuario).then((res) => {
    expect(res.status, 'pré-condição: criar usuário').to.eq(201)
    cy.registrarParaLimpeza('usuario', res.body._id)
    return cy.wrap({ usuario, id: res.body._id })
  })
})

Cypress.Commands.add('loginApi', (email, password) => {
  return cy
    .apiRequest<{ authorization: string }>('POST', '/login', { email, password })
    .then((res) => {
      expect(res.status, 'pré-condição: login').to.eq(200)
      return cy.wrap(res.body.authorization)
    })
})

Cypress.Commands.add('criarProduto', (token, produto = novoProduto()) => {
  return cy.apiRequest<{ _id: string }>('POST', '/produtos', produto, token).then((res) => {
    expect(res.status, 'pré-condição: criar produto').to.eq(201)
    cy.registrarParaLimpeza('produto', res.body._id, token)
    return cy.wrap({ produto, id: res.body._id })
  })
})

Cypress.Commands.add('logarNaInterface', (usuario, rota) => {
  cy.loginApi(usuario.email, usuario.password).then((token) => {
    cy.visit(rota, {
      onBeforeLoad(win) {
        win.localStorage.setItem('serverest/userToken', token)
        win.localStorage.setItem('serverest/userEmail', usuario.email)
        win.localStorage.setItem('serverest/userNome', usuario.nome)
      },
    })
  })
})

const ajv = new Ajv({ allErrors: true })
Cypress.Commands.add('validarContrato', (schema, body) => {
  cy.fixture(`schemas/${schema}.json`).then((definicao) => {
    const validar = ajv.compile(definicao)
    const valido = validar(body)
    expect(valido, `contrato "${schema}": ${ajv.errorsText(validar.errors)}`).to.equal(true)
  })
})

Cypress.Commands.add('getByTestId', (id) => cy.get(`[data-testid="${id}"]`))

export {}
