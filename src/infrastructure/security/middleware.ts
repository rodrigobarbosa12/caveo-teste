import { Request, Next } from 'koa'
import * as jwt from 'jsonwebtoken'

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
    case originalUrl.startsWith('/auth/'):
      return true

    default:
      return false
  }
}

async function middleware({ request: req, response: res }, next: Next): Promise<void> {
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

  const { SECRET_KEY } = process.env

  try {
    const decoded = await jwt.verify(token, SECRET_KEY)

    req.session = {
      userId: decoded.id,
      email: decoded.email,
      userRole: decoded.role,
    }

    await next()
  } catch (error) {
    res.status = 401
    res.body = { message: 'Token inválido ou expirado' }
  }
}

export default middleware
