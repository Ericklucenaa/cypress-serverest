import { novoUsuario } from '../../support/factories'
import loginPage from '../../support/pages/LoginPage'

describe('Interface - Login', () => {
  beforeEach(() => {
    loginPage.visitar()
  })

  it('administrador entra e vê o painel administrativo', () => {
    cy.criarUsuario(novoUsuario(true)).then(({ usuario }) => {
      cy.intercept('POST', '**/login').as('login')

      loginPage.logar(usuario.email, usuario.password)

      // garante que a tela enviou exatamente as credenciais digitadas
      cy.wait('@login').then(({ request, response }) => {
        expect(request.body).to.deep.eq({ email: usuario.email, password: usuario.password })
        expect(response?.statusCode).to.eq(200)
      })
      cy.location('pathname').should('eq', '/admin/home')
      cy.contains('h1', `Bem Vindo ${usuario.nome}`).should('be.visible')
    })
  })

  it('usuário comum entra e vê a loja', () => {
    cy.criarUsuario(novoUsuario(false)).then(({ usuario }) => {
      loginPage.logar(usuario.email, usuario.password)

      cy.location('pathname').should('eq', '/home')
      cy.contains('h1', 'Serverest Store').should('be.visible')
    })
  })

  it('mostra erro com senha incorreta e continua na tela de login', () => {
    cy.criarUsuario().then(({ usuario }) => {
      loginPage.logar(usuario.email, 'senha-incorreta')

      loginPage.mensagemDeErro().should('contain.text', 'Email e/ou senha inválidos')
      cy.location('pathname').should('eq', '/login')
    })
  })

  it('mostra erro amigável quando o servidor está fora do ar (resposta simulada)', () => {
    cy.intercept('POST', '**/login', { statusCode: 500, body: { message: 'Erro interno' } }).as(
      'loginComFalha',
    )

    loginPage.logar('qualquer@teste.com.br', 'qualquer')

    cy.wait('@loginComFalha')
    cy.location('pathname').should('eq', '/login')
    cy.window().its('localStorage').invoke('getItem', 'serverest/userToken').should('be.null')
  })
})
