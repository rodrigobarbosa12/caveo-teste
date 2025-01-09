import Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as swaggerUi from 'swagger-ui-koa'
import router from 'src/interfaces/routes'
import middleware from '../security/middleware'

const app = new Koa()

app.use(bodyParser())
app.use(swaggerUi.serve)
app.use(middleware)
app.use(router.routes()).use(router.allowedMethods())

export default app
