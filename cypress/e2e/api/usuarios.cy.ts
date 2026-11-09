import { novoUsuario } from '../../support/factories'

describe('API - Usuários', () => {
  it('cadastra um usuário e o recupera pelo id', () => {
    const usuario = novoUsuario()

    cy.apiRequest<{ message: string; _id: string }>('POST', '/usuarios', usuario).then((res) => {
      expect(res.status).to.eq(201)
      cy.validarContrato('cadastro', res.body)
      cy.registrarParaLimpeza('usuario', res.body._id)

      cy.apiRequest('GET', `/usuarios/${res.body._id}`).then((consulta) => {
        expect(consulta.status).to.eq(200)
        cy.validarContrato('usuario', consulta.body)
        expect(consulta.body).to.include(usuario)
      })
    })
  })

  it('filtra a listagem por e-mail e valida o contrato', () => {
    cy.criarUsuario().then(({ usuario, id }) => {
      cy.apiRequest<{ quantidade: number; usuarios: { _id: string }[] }>(
        'GET',
        `/usuarios?email=${encodeURIComponent(usuario.email)}`,
      ).then((res) => {
        expect(res.status).to.eq(200)
        cy.validarContrato('listaUsuarios', res.body)
        expect(res.body.quantidade).to.eq(1)
        expect(res.body.usuarios[0]._id).to.eq(id)
      })
    })
  })

  it('não permite cadastrar dois usuários com o mesmo e-mail', () => {
    cy.criarUsuario().then(({ usuario }) => {
      cy.apiRequest('POST', '/usuarios', { ...novoUsuario(), email: usuario.email }).then((res) => {
        expect(res.status).to.eq(400)
        expect(res.body).to.deep.eq({ message: 'Este email já está sendo usado' })
      })
    })
  })

  it('informa todos os campos obrigatórios ausentes', () => {
    cy.apiRequest('POST', '/usuarios', {}).then((res) => {
      expect(res.status).to.eq(400)
      expect(res.body).to.deep.eq({
        nome: 'nome é obrigatório',
        email: 'email é obrigatório',
        password: 'password é obrigatório',
        administrador: 'administrador é obrigatório',
      })
    })
  })

  it('altera os dados de um usuário', () => {
    cy.criarUsuario().then(({ usuario, id }) => {
      const alterado = { ...usuario, nome: `${usuario.nome} Alterado` }

      cy.apiRequest('PUT', `/usuarios/${id}`, alterado).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.deep.eq({ message: 'Registro alterado com sucesso' })
      })
      cy.apiRequest('GET', `/usuarios/${id}`).its('body.nome').should('eq', alterado.nome)
    })
  })

  it('exclui um usuário e ele deixa de existir', () => {
    cy.criarUsuario().then(({ id }) => {
      cy.apiRequest('DELETE', `/usuarios/${id}`).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.deep.eq({ message: 'Registro excluído com sucesso' })
      })
      cy.apiRequest('GET', `/usuarios/${id}`).then((res) => {
        expect(res.status).to.eq(400)
        expect(res.body).to.deep.eq({ message: 'Usuário não encontrado' })
      })
    })
  })
})
