import { createUser, authUser } from 'src/application/auth'
import { User } from 'src/infrastructure/database/typeorm/entity/Users'
import appDataSource from 'src/infrastructure/database/typeorm'
import * as bcryptjs from 'bcryptjs'
import { hash } from 'bcryptjs'
import * as jwt from 'jsonwebtoken'

jest.mock('src/infrastructure/database/typeorm', () => ({
  default: {
    getRepository: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

describe('createUser', () => {
  let mockUserRepository;

  beforeEach(() => {
    mockUserRepository = {
      findOne: jest.fn(),
      manager: {
        transaction: jest.fn(),
      },
    };

    (appDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar um novo usuário com sucesso', async () => {
    const data = {
      email: 'rodrigo@email.com',
      password: 'teste#123',
      name: 'Rodrigo Barbosa',
      role: 'admin'
    } as User

    const hashedPassword = 'hashedPassword123';
    (hash as jest.Mock).mockResolvedValue(hashedPassword);

    const newUser = { ...data, password: hashedPassword, isOnboarded: false };

    mockUserRepository.manager.transaction.mockImplementation(async (callback: any) => {
      return await callback({
        save: jest.fn().mockResolvedValue(newUser),
      });
    });

    mockUserRepository.findOne.mockResolvedValue(null);

    const result = await createUser(data);

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: data.email } });
    expect(hash).toHaveBeenCalledWith(data.password, 10);
    expect(mockUserRepository.manager.transaction).toHaveBeenCalled();
    expect(result).toEqual(newUser);
  });

  it('deve lançar erro se o usuário já existir', async () => {
    mockUserRepository.findOne.mockResolvedValue({ id: 1, email: 'rodrigo@email.com' });

    const data = {
      email: 'rodrigo@email.com',
      password: 'teste#123',
      name: 'Rodrigo Barbosa',
      role: 'admin'
    } as User

    await expect(createUser(data)).rejects.toThrow('Usuário já existe!');
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: data.email } });
    expect(hash).not.toHaveBeenCalled();
    expect(mockUserRepository.manager.transaction).not.toHaveBeenCalled();
  });

  it('deve lançar erro se a transação falhar', async () => {
    const data = {
      email: 'rodrigo@email.com',
      password: 'teste#123',
      name: 'Rodrigo Barbosa',
      role: 'admin'
    } as User

    const hashedPassword = 'hashedPassword123';
    (hash as jest.Mock).mockResolvedValue(hashedPassword);

    mockUserRepository.findOne.mockResolvedValue(null);

    mockUserRepository.manager.transaction.mockRejectedValue(new Error('Transaction failed'));

    await expect(createUser(data)).rejects.toThrow('Transaction failed');
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: data.email } });
    expect(hash).toHaveBeenCalledWith(data.password, 10);
    expect(mockUserRepository.manager.transaction).toHaveBeenCalled();
  });
});

describe('authUser', () => {
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      findOne: jest.fn(),
    };

    (appDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve autenticar um usuário com sucesso e retornar um token', async () => {
    const user = {
      id: 1,
      email: 'rodrigo@email.com',
      name: 'Rodrigo Barbosa',
      // password: 'teste#123',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const token = 'mockedToken';

    mockUserRepository.findOne.mockResolvedValue(user);
    (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue(token);

    const result = await authUser({ email: 'rodrigo@email.com', password: 'teste#123' });

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'rodrigo@email.com' } });
    expect(bcryptjs.compare).toHaveBeenCalledWith('teste#123', undefined);
    expect(result).toEqual({ token });
  });

  it('deve lançar erro se o usuário não for encontrado', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(authUser({ email: 'invalid@example.com', password: 'teste#123' }))
      .rejects
      .toThrow('Usuário não encontrado!');

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'invalid@example.com' } });
  });

  it('deve lançar erro se a senha estiver incorreta', async () => {
    const user = {
      id: 1,
      email: 'rodrigo@email.com',
      name: 'Rodrigo Barbosa',
      password: 'teste#123',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    mockUserRepository.findOne.mockResolvedValue(user);
    (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

    await expect(authUser({ email: 'rodrigo@email.com', password: 'teste#123' }))
      .rejects
      .toThrow('Senha incorreta!');

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'rodrigo@email.com' } });
    expect(bcryptjs.compare).toHaveBeenCalledWith('teste#123', user.password);
  });
});

