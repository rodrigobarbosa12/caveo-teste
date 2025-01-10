import { createUser, authUser } from 'src/application/auth'
import { confirmUserAWS } from 'src/application/aws'

export async function authCreate({ request, response }) {
  try {
    const { body } = request

    await createUser(body)

    response.body = { message: 'Usuário criado, código de verificação enviado por email' }
  } catch (error) {
    response.status = error.status || 401
    response.body = { message: error.message }
  }
}

export async function confirmUser({ request, response }) {
  try {
    const { body } = request

    await confirmUserAWS(body)

    response.body = { message: 'Usuário confirmado' }
  } catch (error) {
    response.status = error.status || 401
    response.body = { message: error.message }
  }
}

export async function auth({ request, response }) {
  try {
     const { body } = request

     const result = await authUser(body)

     response.body = result
  } catch (error) {
     response.status = error.status || 401
     response.body = { message: error.message }
  }
}
