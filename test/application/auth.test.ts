import { createUser, authUser } from 'src/application/auth'
import { signUpAWS, signInAWS } from 'src/application/aws'
import { User } from 'src/infrastructure/database/typeorm/entity/Users'
import appDataSource from 'src/infrastructure/database/typeorm'

jest.mock('src/infrastructure/database/typeorm', () => ({
  default: {
    getRepository: jest.fn(),
  },
}))

jest.mock('src/application/aws', () => ({
  signUpAWS: jest.fn(),
  signInAWS: jest.fn(),
}))

describe('createUser', () => {
  let mockUserRepository

  beforeEach(() => {
    mockUserRepository = {
      findOne: jest.fn(),
      manager: {
        transaction: jest.fn(),
      },
    }
    ;(appDataSource.getRepository as jest.Mock).mockReturnValue(
      mockUserRepository,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('deve criar um novo usuário com sucesso', async () => {
    const data = {
      email: 'rodrigo@email.com',
      password: 'Mudar@123',
      name: 'Rodrigo Barbosa',
      role: 'admin',
    } as User

    const newUser = { ...data, isOnboarded: false }

    mockUserRepository.manager.transaction.mockImplementation(
      async (callback: any) => {
        return await callback({
          save: jest.fn().mockResolvedValue(newUser),
        })
      },
    )

    mockUserRepository.findOne.mockResolvedValue(null)

    const result = await createUser(data)

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { email: data.email },
    })
    expect(mockUserRepository.manager.transaction).toHaveBeenCalled()
    expect(result).toEqual(newUser)

    expect(signUpAWS).toHaveBeenCalledWith({
      email: data.email,
      password: data.password,
      name: data.name,
    })
  })

  it('deve lançar erro se o usuário já existir', async () => {
    mockUserRepository.findOne.mockResolvedValue({
      id: 1,
      email: 'rodrigo@email.com',
    })

    const data = {
      email: 'rodrigo@email.com',
      password: 'Mudar@123',
      name: 'Rodrigo Barbosa',
      role: 'admin',
    } as User

    await expect(createUser(data)).rejects.toThrow('Usuário já existe!')
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { email: data.email },
    })
    expect(mockUserRepository.manager.transaction).not.toHaveBeenCalled()
  })

  it('deve lançar erro se a transação falhar', async () => {
    const data = {
      email: 'rodrigo@email.com',
      password: 'Mudar@123',
      name: 'Rodrigo Barbosa',
      role: 'admin',
    } as User

    mockUserRepository.findOne.mockResolvedValue(null)

    mockUserRepository.manager.transaction.mockRejectedValue(
      new Error('Transaction failed'),
    )

    await expect(createUser(data)).rejects.toThrow('Transaction failed')
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { email: data.email },
    })
    expect(mockUserRepository.manager.transaction).toHaveBeenCalled()
  })
})

describe('authUser', () => {
  let mockUserRepository: any

  beforeEach(() => {
    mockUserRepository = {
      findOne: jest.fn(),
    }
    ;(appDataSource.getRepository as jest.Mock).mockReturnValue(
      mockUserRepository,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('deve autenticar um usuário com sucesso e retornar um token', async () => {
    const user = {
      id: 1,
      email: 'rodrigo@email.com',
      name: 'Rodrigo Barbosa',
      password: 'Mudar@123',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    }

    mockUserRepository.findOne.mockResolvedValue(user)

    const result = await authUser({
      email: 'rodrigo@email.com',
      password: 'Mudar@123',
    })

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'rodrigo@email.com' },
    })
    expect(signInAWS).toHaveBeenCalledWith('rodrigo@email.com', 'Mudar@123')
    expect(result).toEqual(undefined)
  })

  it('deve lançar erro se o usuário não for encontrado', async () => {
    mockUserRepository.findOne.mockResolvedValue(null)

    await expect(
      authUser({ email: 'invalid@example.com', password: 'Mudar@123' }),
    ).rejects.toThrow('Usuário ou senha inválidos!')

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'invalid@example.com' },
    })
  })
})
