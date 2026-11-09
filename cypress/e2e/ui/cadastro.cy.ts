import { novoUsuario } from '../../support/factories'
import cadastroPage from '../../support/pages/CadastroUsuarioPage'

describe('Interface - Cadastro de usuário', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/usuarios').as('cadastro')
    cadastroPage.visitar()
  })

  const registrarCriado = () =>
    cy.wait('@cadastro').then(({ response }) => {
      expect(response?.statusCode).to.eq(201)
      cy.registrarParaLimpeza('usuario', response?.body._id)
    })

  it('cadastra um usuário comum e já entra na loja', () => {
    cadastroPage.preencher(novoUsuario(false))
    cadastroPage.cadastrar()

    registrarCriado()
    cadastroPage.alerta().should('contain.text', 'Cadastro realizado com sucesso')
    cy.location('pathname').should('eq', '/home')
  })

  it('cadastra um administrador e já entra no painel', () => {
    const admin = novoUsuario(true)
    cadastroPage.preencher(admin)
    cadastroPage.cadastrar()

    registrarCriado()
    cy.location('pathname').should('eq', '/admin/home')
    cy.contains('h1', `Bem Vindo ${admin.nome}`).should('be.visible')
  })

  it('avisa quando o e-mail já está em uso', () => {
    cy.criarUsuario().then(({ usuario }) => {
      cadastroPage.preencher({ ...novoUsuario(), email: usuario.email })
      cadastroPage.cadastrar()

      cy.wait('@cadastro').its('response.statusCode').should('eq', 400)
      cadastroPage.alerta().should('contain.text', 'Este email já está sendo usado')
      cy.location('pathname').should('eq', '/cadastrarusuarios')
    })
  })
})
