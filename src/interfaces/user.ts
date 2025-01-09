import { editAccount, getAllUsers } from 'src/application/user'

export async function editAccountById({ request, response }) {
  try {
    const { body, params: { id }, session } = request

    await editAccount(id, body, session.userRole)

    response.body = { message: 'Usuário atualizado com sucesso!'}
  } catch (error) {
    response.status = error.status || 401
    response.body = { message: error.message }
  }
}

export async function getUsers({ request, response }) {
  try {
    const { session } = request

    if (session.userRole !== 'admin') {
      throw new Error('Permissão negada')
    }

    response.body = await getAllUsers()
  } catch (error) {
    response.status = error.status || 401
    response.body = { message: error.message }
  }
}
