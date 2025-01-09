import { createUser, authUser } from 'src/application/auth'

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

export async function authCreate({ request, response }) {
   try {
      const { body } = request

      await createUser(body)

      response.body = { message: 'User created' }
   } catch (error) {
      response.status = error.status || 401
      response.body = { message: error.message }
   }
}
