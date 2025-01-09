import { User } from 'src/infrastructure/database/typeorm/entity/Users'
import appDataSource from 'src/infrastructure/database/typeorm/index'
import { ExceptionError } from 'src/infrastructure/utils'

export async function editAccount(id: number, data: User, userRole: string) {
  const { name, role } = data

  const userRepository = appDataSource.getRepository(User)
  const user = await userRepository.findOneBy({ id })

  if (!user) throw ExceptionError('Usuário não encontrado', 404)

  if (userRole !== 'admin' && userRole !== 'comum') throw ExceptionError('Acesso negado', 401)

  if (userRole === 'admin') {
    user.name = name
    user.role = role
    user.isOnboarded = true
  }

  if (userRole === 'comum') {
    user.name = name
    user.isOnboarded = true
  }

  await userRepository.save(user)
}

export async function getAll() {
  const userRepository = appDataSource.getRepository(User)

  const users = await userRepository.find()

  return users.map(({ password, ...user }) => user)
}

export async function getOneUserByEmail(email: string) {
  const userRepository = appDataSource.getRepository(User)

  const user = await userRepository.findOneBy({ email })

  delete user?.password

  return user
}
