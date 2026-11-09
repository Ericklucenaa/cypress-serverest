describe('API - Login', () => {
  it('autentica com credenciais válidas e devolve um token JWT', () => {
    cy.criarUsuario().then(({ usuario }) => {
      cy.apiRequest('POST', '/login', { email: usuario.email, password: usuario.password }).then(
        (res) => {
          expect(res.status).to.eq(200)
          cy.validarContrato('login', res.body)
        },
      )
    })
  })

  it('recusa senha incorreta', () => {
    cy.criarUsuario().then(({ usuario }) => {
      cy.apiRequest('POST', '/login', { email: usuario.email, password: 'senha-errada' }).then(
        (res) => {
          expect(res.status).to.eq(401)
          expect(res.body).to.deep.eq({ message: 'Email e/ou senha inválidos' })
        },
      )
    })
  })

  it('recusa e-mail que não está cadastrado', () => {
    cy.apiRequest<{ message: string }>('POST', '/login', {
      email: `inexistente.${Date.now()}@teste.com.br`,
      password: 'qualquer',
    }).then((res) => {
      expect(res.status).to.eq(401)
      expect(res.body.message).to.eq('Email e/ou senha inválidos')
    })
  })

  it('exige e-mail e senha', () => {
    cy.apiRequest('POST', '/login', {}).then((res) => {
      expect(res.status).to.eq(400)
      expect(res.body).to.deep.eq({
        email: 'email é obrigatório',
        password: 'password é obrigatório',
      })
    })
  })
})
