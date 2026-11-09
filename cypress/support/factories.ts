import { faker } from '@faker-js/faker/locale/pt_BR'

export interface Usuario {
  nome: string
  email: string
  password: string
  administrador: 'true' | 'false'
}

export interface Produto {
  nome: string
  preco: number
  descricao: string
  quantidade: number
}

/** Gera um usuário único a cada chamada, para os testes não dependerem de dados fixos. */
export function novoUsuario(administrador = false): Usuario {
  const sufixo = `${Date.now()}${faker.string.alphanumeric(5)}`.toLowerCase()
  return {
    nome: faker.person.fullName(),
    email: `qa.${sufixo}@teste.com.br`,
    password: faker.internet.password({ length: 12 }),
    administrador: administrador ? 'true' : 'false',
  }
}

export function novoProduto(): Produto {
  return {
    nome: `${faker.commerce.productName()} QA-${faker.string.alphanumeric(8).toUpperCase()}`,
    preco: faker.number.int({ min: 10, max: 5000 }),
    descricao: faker.commerce.productDescription(),
    quantidade: faker.number.int({ min: 5, max: 200 }),
  }
}
