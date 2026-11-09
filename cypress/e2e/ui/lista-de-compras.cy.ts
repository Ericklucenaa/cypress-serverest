import { novoUsuario, Produto, Usuario } from '../../support/factories'
import { listaDeCompras, loja } from '../../support/pages/LojaPage'

describe('Interface - Loja e lista de compras', () => {
  let cliente: Usuario
  let produto: Produto

  beforeEach(() => {
    // massa de dados criada pela API: o teste foca só no comportamento da tela
    cy.criarUsuario(novoUsuario(true)).then(({ usuario: admin }) => {
      cy.loginApi(admin.email, admin.password).then((token) => {
        cy.criarProduto(token).then((criado) => (produto = criado.produto))
      })
    })
    cy.criarUsuario(novoUsuario(false)).then(({ usuario }) => (cliente = usuario))
  })

  it('pesquisa um produto, adiciona à lista e altera a quantidade', () => {
    cy.logarNaInterface(cliente, '/home')

    loja.pesquisar(produto.nome)
    loja.card(produto.nome).should('be.visible')
    loja.adicionarNaLista(produto.nome)

    cy.location('pathname').should('eq', '/minhaListaDeProdutos')
    listaDeCompras.quantidade(produto.nome).should('contain.text', 'Total: 1')

    listaDeCompras.aumentar(produto.nome)
    listaDeCompras.quantidade(produto.nome).should('contain.text', 'Total: 2')
  })

  it('limpa a lista de compras', () => {
    cy.logarNaInterface(cliente, '/home')
    loja.pesquisar(produto.nome)
    loja.adicionarNaLista(produto.nome)

    listaDeCompras.limpar()

    listaDeCompras.mensagemListaVazia().should('have.text', 'Seu carrinho está vazio')
  })

  it('exibe os produtos devolvidos pela API (resposta simulada com fixture)', () => {
    cy.intercept('GET', '**/produtos*', { fixture: 'produtos-mock.json' }).as('produtos')
    cy.logarNaInterface(cliente, '/home')

    cy.wait('@produtos')
    loja.card('Teclado Mecânico MOCK').should('be.visible')
    loja.card('Mouse Gamer MOCK').should('be.visible')
    cy.get('.card').filter(':contains("MOCK")').should('have.length', 2)
  })
})
