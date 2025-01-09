import { editAccount } from 'src/application/user'

export async function editAccountById({ request, response }, next) {
  try {
    const { body, params: { id }, session } = request

    await editAccount(id, body, session.userRole)

    response.body = { message: 'Usuário atualizado com sucesso!'}
  } catch (error) {
    response.status = error.status || 401
    response.body = { message: error.message }
  } finally {
    await next()
  }
}
