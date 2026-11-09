import { Produto } from '../factories'

class ProdutosAdminPage {
  preencher(produto: Produto) {
    cy.getByTestId('nome').type(produto.nome)
    cy.getByTestId('preco').type(String(produto.preco))
    cy.getByTestId('descricao').type(produto.descricao)
    cy.getByTestId('quantity').type(String(produto.quantidade))
  }

  cadastrar() {
    cy.getByTestId('cadastarProdutos').click() // o id tem esse erro de digitação na própria aplicação
  }

  linhaDoProduto(nome: string) {
    return cy.contains('tr', nome)
  }
}

export default new ProdutosAdminPage()
