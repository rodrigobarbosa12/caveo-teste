import { hash, compare } from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import appDataSource from 'src/infrastructure/database/typeorm'
import { signUpAWS, signInAWS } from './aws'
import { User } from 'src/infrastructure/database/typeorm/entity/Users'
import { ExceptionError } from 'src/infrastructure/utils'

const { SECRET_KEY } = process.env

export async function createUser(data: User) {
   const { email, name, role, password } = data

   const userRepository = appDataSource.getRepository(User)

  const existingUser = await userRepository.findOne({ where: { email } })
  if (existingUser) throw ExceptionError('Usuário já existe!', 401)

  const hashedPassword = await hash(password, 10)

  const newUser = {
   email,
   name,
   role,
   password: hashedPassword,
   isOnboarded: false,
   createdAt: new Date(),
   updatedAt: new Date(),
 }

  return await userRepository.manager.transaction(async transaction => {
    const user = await transaction.save(User, newUser)
    // await signUpAWS(email, password)
    return user
  })
}

export async function authUser({ email, password }) {
  const userRepository = appDataSource.getRepository(User)

  const user = await userRepository.findOne({ where: { email } })
  if (!user) throw new Error('Usuário não encontrado!')

  const passwordMatch = await compare(password, user.password)
  if (!passwordMatch) throw new Error('Senha incorreta!')

  delete user.createdAt
  delete user.updatedAt
  delete user.deletedAt
  delete user.password

  const token = jwt.sign({ ...user }, SECRET_KEY, { expiresIn: '1h' })

  return { token }
}
