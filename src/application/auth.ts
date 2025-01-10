import appDataSource from 'src/infrastructure/database/typeorm'
import { signUpAWS, signInAWS } from './aws'
import { User } from 'src/infrastructure/database/typeorm/entity/Users'
import { ExceptionError } from 'src/infrastructure/utils'

export async function createUser(data: User) {
  const { email, name, role, password } = data

  const userRepository = appDataSource.getRepository(User)

 const existingUser = await userRepository.findOne({ where: { email } })
 if (existingUser) throw ExceptionError('Usuário já existe!', 401)

 const newUser = {
  email,
  name,
  role,
  isOnboarded: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

 return await userRepository.manager.transaction(async transaction => {
   const user = await transaction.save(User, newUser)
   await signUpAWS({ email, password, name })
   return user
 })
}

export async function authUser({ email, password }) {
  const userRepository = appDataSource.getRepository(User)

  const user = await userRepository.findOne({ where: { email } })
  if (!user) throw new Error('Usuário ou senha inválidos!')

  return await signInAWS(email, password)
}
