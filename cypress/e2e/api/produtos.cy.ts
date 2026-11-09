import { novoProduto, novoUsuario } from '../../support/factories'

describe('API - Produtos', () => {
  let tokenAdmin: string

  beforeEach(() => {
    cy.criarUsuario(novoUsuario(true)).then(({ usuario }) => {
      cy.loginApi(usuario.email, usuario.password).then((token) => {
        tokenAdmin = token
      })
    })
  })

  it('administrador cadastra um produto e ele pode ser consultado', () => {
    const produto = novoProduto()

    cy.apiRequest<{ _id: string }>('POST', '/produtos', produto, tokenAdmin).then((res) => {
      expect(res.status).to.eq(201)
      cy.validarContrato('cadastro', res.body)
      cy.registrarParaLimpeza('produto', res.body._id, tokenAdmin)

      cy.apiRequest('GET', `/produtos/${res.body._id}`).then((consulta) => {
        expect(consulta.status).to.eq(200)
        cy.validarContrato('produto', consulta.body)
        expect(consulta.body).to.include(produto)
      })
    })
  })

  it('não permite cadastrar sem token', () => {
    cy.apiRequest<{ message: string }>('POST', '/produtos', novoProduto()).then((res) => {
      expect(res.status).to.eq(401)
      expect(res.body.message).to.eq(
        'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais',
      )
    })
  })

  it('não permite que um usuário comum cadastre produtos', () => {
    cy.criarUsuario(novoUsuario(false)).then(({ usuario }) => {
      cy.loginApi(usuario.email, usuario.password).then((tokenComum) => {
        cy.apiRequest('POST', '/produtos', novoProduto(), tokenComum).then((res) => {
          expect(res.status).to.eq(403)
          expect(res.body).to.deep.eq({ message: 'Rota exclusiva para administradores' })
        })
      })
    })
  })

  it('não permite dois produtos com o mesmo nome', () => {
    cy.criarProduto(tokenAdmin).then(({ produto }) => {
      cy.apiRequest('POST', '/produtos', { ...novoProduto(), nome: produto.nome }, tokenAdmin).then(
        (res) => {
          expect(res.status).to.eq(400)
          expect(res.body).to.deep.eq({ message: 'Já existe produto com esse nome' })
        },
      )
    })
  })

  it('administrador exclui um produto', () => {
    cy.criarProduto(tokenAdmin).then(({ id }) => {
      cy.apiRequest('DELETE', `/produtos/${id}`, undefined, tokenAdmin).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.deep.eq({ message: 'Registro excluído com sucesso' })
      })
      cy.apiRequest('GET', `/produtos/${id}`).its('status').should('eq', 400)
    })
  })
})
