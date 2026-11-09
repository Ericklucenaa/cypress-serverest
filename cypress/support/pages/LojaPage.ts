class LojaPage {
  pesquisar(termo: string) {
    cy.getByTestId('pesquisar').clear()
    cy.getByTestId('pesquisar').type(termo)
    cy.getByTestId('botaoPesquisar').click()
  }

  card(nome: string) {
    return cy.contains('.card', nome)
  }

  adicionarNaLista(nome: string) {
    this.card(nome).within(() => cy.getByTestId('adicionarNaLista').click())
  }
}

class ListaDeComprasPage {
  item(nome: string) {
    return cy.contains('[data-testid="shopping-cart-product-name"]', nome).parent()
  }

  quantidade(nome: string) {
    return this.item(nome).find('[data-testid="shopping-cart-product-quantity"]')
  }

  aumentar(nome: string) {
    this.item(nome).find('[data-testid="product-increase-quantity"]').click()
  }

  limpar() {
    cy.getByTestId('limparLista').click()
  }

  mensagemListaVazia() {
    return cy.getByTestId('shopping-cart-empty-message')
  }
}

export const loja = new LojaPage()
export const listaDeCompras = new ListaDeComprasPage()
