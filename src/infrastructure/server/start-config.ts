import Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import router from 'src/interfaces/routes'
// import middleware from '../security/middleware'

const app = new Koa()

// app.use(middleware)
app.use(bodyParser())
app.use(router.routes()).use(router.allowedMethods())

export default app
