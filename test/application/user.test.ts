import { GetUserCommand } from '@aws-sdk/client-cognito-identity-provider'
import { cognitoClient } from 'src/application/aws'
import {
  editAccount,
  getAll,
  getUserForTokenAWS,
  getOneUserByEmail,
} from 'src/application/user'
import { User } from 'src/infrastructure/database/typeorm/entity/Users'
import appDataSource from 'src/infrastructure/database/typeorm'

jest.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  GetUserCommand: jest.fn(),
}))

jest.mock('src/application/aws', () => ({
  cognitoClient: {
    send: jest.fn(),
  },
}))

jest.mock('src/infrastructure/database/typeorm', () => ({
  default: {
    getRepository: jest.fn(),
  },
}))

describe('editAccount', () => {
  let mockUserRepository

  beforeEach(() => {
    mockUserRepository = {
      findOneBy: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    }
    ;(appDataSource.getRepository as jest.Mock).mockReturnValue(
      mockUserRepository,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('deve editar um usuário com sucesso para o role admin', async () => {
    const user = {
      id: 1,
      name: 'Old Name',
      role: 'comum',
      isOnboarded: false,
    }

    const updatedData = { name: 'New Name', role: 'admin' } as User

    mockUserRepository.findOneBy.mockResolvedValue(user)
    mockUserRepository.save.mockResolvedValue({
      ...user,
      ...updatedData,
      isOnboarded: true,
    })

    await editAccount(1, updatedData, 'admin')

    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 })
    expect(mockUserRepository.save).toHaveBeenCalledWith({
      ...user,
      ...updatedData,
      isOnboarded: true,
    })
  })

  it('deve editar um usuário com sucesso para o role comum', async () => {
    const user = {
      id: 2,
      name: 'Old Name',
      role: 'comum',
      isOnboarded: false,
    }

    const updatedData = { name: 'New Name', role: 'admin' } as User

    mockUserRepository.findOneBy.mockResolvedValue(user)
    mockUserRepository.save.mockResolvedValue({
      ...user,
      name: 'New Name',
      isOnboarded: true,
    })

    await editAccount(2, updatedData, 'comum')

    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 2 })
    expect(mockUserRepository.save).toHaveBeenCalledWith({
      ...user,
      name: 'New Name',
      isOnboarded: true,
    })
  })

  it('deve lançar um erro se o usuário não for encontrado', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(null)

    await expect(
      editAccount(99, { name: 'Test', role: 'admin' } as User, 'admin'),
    ).rejects.toThrow('Usuário não encontrado')

    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 99 })
    expect(mockUserRepository.save).not.toHaveBeenCalled()
  })

  it('deve lançar um erro se o usuário não tiver permissão', async () => {
    const user = {
      id: 3,
      name: 'Old Name',
      role: 'comum',
      isOnboarded: false,
    }

    mockUserRepository.findOneBy.mockResolvedValue(user)

    await expect(
      editAccount(3, { name: 'Test', role: 'admin' } as User, 'guest'),
    ).rejects.toThrow('Acesso negado')

    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 3 })
    expect(mockUserRepository.save).not.toHaveBeenCalled()
  })
})

describe('getAll', () => {
  let mockUserRepository: any

  beforeEach(() => {
    mockUserRepository = appDataSource.getRepository(User)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('deve retornar todos os usuários sem a senha', async () => {
    const users = [
      { id: 1, name: 'User 1', password: 'password123', role: 'admin' },
      { id: 2, name: 'User 2', password: 'password456', role: 'comum' },
    ]

    mockUserRepository.find.mockResolvedValue(users)

    const result = await getAll()

    expect(mockUserRepository.find).toHaveBeenCalled()
    expect(result).toEqual([
      { id: 1, name: 'User 1', role: 'admin' },
      { id: 2, name: 'User 2', role: 'comum' },
    ])
  })

  it('deve retornar um array vazio se não houver usuários', async () => {
    mockUserRepository.find.mockResolvedValue([])

    const result = await getAll()

    expect(mockUserRepository.find).toHaveBeenCalled()
    expect(result).toEqual([])
  })

  it('deve retornar apenas os usuários sem a senha', async () => {
    const users = [
      { id: 1, name: 'User 1', password: 'password123', role: 'admin' },
      { id: 2, name: 'User 2', password: 'password456', role: 'comum' },
    ]

    mockUserRepository.find.mockResolvedValue(users)

    const result = await getAll()

    expect(mockUserRepository.find).toHaveBeenCalled()
    result.forEach((user) => {
      expect(user).not.toHaveProperty('password')
    })
  })
})

describe('getOneUserByEmail', () => {
  let mockUserRepository: any

  beforeEach(() => {
    mockUserRepository = appDataSource.getRepository(User)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('deve retornar o usuário encontrado sem a senha', async () => {
    const user = {
      id: 1,
      email: 'user@example.com',
      name: 'User 1',
      password: 'password123',
      role: 'admin',
    }

    mockUserRepository.findOneBy.mockResolvedValue(user)

    const result = await getOneUserByEmail('user@example.com')

    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
      email: 'user@example.com',
    })
    expect(result).toEqual({
      id: 1,
      email: 'user@example.com',
      name: 'User 1',
      role: 'admin',
    })
    expect(result).not.toHaveProperty('password')
  })

  it('deve retornar null se o usuário não for encontrado', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(null)

    const result = await getOneUserByEmail('nonexistent@example.com')

    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
      email: 'nonexistent@example.com',
    })
    expect(result).toBeNull()
  })
})

describe('getUserForTokenAWS', () => {
  let mockUserRepository: any

  beforeEach(() => {
    mockUserRepository = appDataSource.getRepository(User)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('deve retornar o usuário encontrado no banco de dados com base no email do token AWS', async () => {
    const token = 'fake-token'
    const awsResponse = {
      UserAttributes: [{ Name: 'email', Value: 'user@example.com' }],
    }

    const userFromDb = {
      id: 1,
      email: 'user@example.com',
      name: 'User 1',
      password: 'password123',
      role: 'admin',
    }

    ;(cognitoClient.send as jest.Mock).mockResolvedValue(awsResponse)

    mockUserRepository.findOneBy.mockResolvedValue(userFromDb)

    const result = await getUserForTokenAWS(token)

    expect(cognitoClient.send).toHaveBeenCalledWith(expect.any(GetUserCommand))
    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
      email: 'user@example.com',
    })
    expect(result).toEqual({
      id: 1,
      email: 'user@example.com',
      name: 'User 1',
      role: 'admin',
    })
    expect(result).not.toHaveProperty('password')
  })

  it('deve lançar um erro se o usuário não for encontrado no banco de dados', async () => {
    const token = 'fake-token'
    const awsResponse = {
      UserAttributes: [{ Name: 'email', Value: 'user@example.com' }],
    }

    ;(cognitoClient.send as jest.Mock).mockResolvedValue(awsResponse)

    mockUserRepository.findOneBy.mockResolvedValue(null)

    await expect(getUserForTokenAWS(token)).rejects.toThrow(
      'Usuário não encontrado',
    )

    expect(cognitoClient.send).toHaveBeenCalledWith(expect.any(GetUserCommand))
    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
      email: 'user@example.com',
    })
  })
})
