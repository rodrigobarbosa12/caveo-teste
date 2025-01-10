import { Next } from 'koa'
import { getUserForTokenAWS } from 'src/application/user'

interface Decoded {
  id: number
  email: string
  role: 'admin' | 'comum'
}

const freeAccess = (originalUrl: string, method: string) => {
  /**
   * originalUrl.startsWith ignora qualquer coisa depois da ultima barra
   */
  switch (true) {
    case originalUrl === '/auth':
    case originalUrl === '/docs':
    case originalUrl.startsWith('/auth/'):
      return true

    default:
      return false
  }
}

async function middleware(
  { request: req, response: res },
  next: Next,
): Promise<void> {
  if (freeAccess(req.path, req.method)) {
    await next()
    return
  }

  const authHeader = req.headers.authorization

  if (!authHeader) {
    res.status = 401
    res.body = { message: 'Você não está autorizado' }
    return
  }

  const parts = authHeader.split(' ')

  if (parts.length !== 2) {
    res.status = 401
    res.body = { message: 'Token error' }
    return
  }

  const [schema, token] = parts

  if (!/^Bearer$/i.test(schema)) {
    res.status = 401
    res.body = { message: 'Token mal formado' }
    return
  }

  try {
    const user = await getUserForTokenAWS(token)

    req.session = {
      userId: user.id,
      email: user.email,
      userRole: user.role,
    }

    await next()
  } catch (error) {
    res.status = 401
    res.body = { message: 'Token inválido ou expirado' }
  }
}

export default middleware
