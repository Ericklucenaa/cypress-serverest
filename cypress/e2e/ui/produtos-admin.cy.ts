import { novoProduto, novoUsuario, Usuario } from '../../support/factories'
import produtosPage from '../../support/pages/ProdutosAdminPage'

describe('Interface - Gestão de produtos (administrador)', () => {
  let admin: Usuario
  let tokenAdmin: string

  beforeEach(() => {
    cy.criarUsuario(novoUsuario(true)).then(({ usuario }) => {
      admin = usuario
      cy.loginApi(usuario.email, usuario.password).then((token) => (tokenAdmin = token))
    })
  })

  it('cadastra um produto e ele aparece na listagem', () => {
    const produto = novoProduto()
    cy.intercept('POST', '**/produtos').as('cadastroProduto')
    cy.logarNaInterface(admin, '/admin/cadastrarprodutos')

    produtosPage.preencher(produto)
    produtosPage.cadastrar()

    cy.wait('@cadastroProduto').then(({ response }) => {
      expect(response?.statusCode).to.eq(201)
      cy.registrarParaLimpeza('produto', response?.body._id, tokenAdmin)
    })
    cy.location('pathname').should('eq', '/admin/listarprodutos')
    produtosPage
      .linhaDoProduto(produto.nome)
      .should('contain.text', produto.preco)
      .and('contain.text', produto.quantidade)
  })

  it('lista produtos criados previamente via API', () => {
    cy.criarProduto(tokenAdmin).then(({ produto }) => {
      cy.logarNaInterface(admin, '/admin/listarprodutos')
      produtosPage.linhaDoProduto(produto.nome).should('be.visible')
    })
  })
})
