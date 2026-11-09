import { Usuario } from '../factories'

class CadastroUsuarioPage {
  visitar() {
    cy.visit('/cadastrarusuarios')
  }

  preencher(usuario: Usuario) {
    cy.getByTestId('nome').type(usuario.nome)
    cy.getByTestId('email').type(usuario.email)
    cy.getByTestId('password').type(usuario.password, { log: false })
    if (usuario.administrador === 'true') cy.getByTestId('checkbox').check()
  }

  cadastrar() {
    cy.getByTestId('cadastrar').click()
  }

  alerta() {
    return cy.get('.alert')
  }
}

export default new CadastroUsuarioPage()
