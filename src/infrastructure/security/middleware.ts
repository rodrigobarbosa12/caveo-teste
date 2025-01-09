import { Request, Next } from 'koa'
import * as jwt from 'jsonwebtoken'

interface Decoded {
  id: number
  email: string
  access: string
}

const freeAccess = (originalUrl: string, method: string) => {
  if (method === 'GET' && originalUrl.match(/\/order\/.+/g)) {
    return true
  }

  /**
   * originalUrl.startsWith ignora qualquer coisa depois da ultima barra
   */
  switch (true) {
    case originalUrl === '/auth/webhook-teste':
    case originalUrl === '/auth/login':
    case originalUrl === '/auth/signup':
    case originalUrl === '/auth/forgot-password':
    case originalUrl === '/scheduling/to-schedule-no-login':
    case originalUrl === '/company/all':
    case originalUrl.startsWith('/auth/confirm-email/'):
    case originalUrl.startsWith('/auth/accept-invitation/'):
    case originalUrl.startsWith('/scheduling/list/'):
    case originalUrl.startsWith('/scheduling/check/'):
    case originalUrl.startsWith('/public/images/'):
      return true

    default:
      return false
  }
}

const middleware = ({ req, res }, next: Next): void => {
  if (freeAccess(req.path, req.method)) {
    next()
    return
  }

  const authHeader = req.headers.authorization

  if (!authHeader) {
    res.status(401).send({ message: 'Você não está autorizado' })
    return
  }

  // Bearer lkasdjfksdfaDJKÇLÇLKASDA
  const parts = authHeader.split(' ')

  if (parts.length !== 2) {
    res.status(401).send({ message: 'Token error' })
    return
  }

  const [schema, token] = parts

  // Verifica se Schema tem a palavra Bearer
  if (!/^Bearer$/i.test(schema)) {
    res.status(401).send({ message: 'Token mal formado' })
    return
  }

  // verifica token
  jwt.verify(
    token,
    'secret a-dsasddsa- a-sd-sa-ds-asd-dsa-dsa-dsa-asd',
    (err: jwt.VerifyErrors | null, decoded: Decoded): void => {
      if (err) {
        res.status(401).send({ message: 'Token invalido' })
        return
      }

      // req.session = {
      //   userId: decoded.id,
      //   email: decoded.email,
      //   access: decoded.access,
      // }

      next()
    },
  )
}

export default middleware
