class LoginPage {
  visitar() {
    cy.visit('/login')
  }

  preencher(email: string, senha: string) {
    if (email) cy.getByTestId('email').type(email)
    if (senha) cy.getByTestId('senha').type(senha, { log: false })
  }

  entrar() {
    cy.getByTestId('entrar').click()
  }

  logar(email: string, senha: string) {
    this.preencher(email, senha)
    this.entrar()
  }

  mensagemDeErro() {
    return cy.get('.alert')
  }
}

export default new LoginPage()
