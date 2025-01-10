import * as Router from '@koa/router'
import * as swaggerUi from 'swagger-ui-koa'
import * as swaggerJSDoc from 'swagger-jsdoc'
import swaggerOptions from 'src/infrastructure/swagger/config'
import { auth, authCreate, confirmUser } from './auth'
import { getAllUsers, getMyUserOnly, editAccountById } from './user'

const router = new Router()
const swaggerSpec = swaggerJSDoc(swaggerOptions)

/**\
 * SWAGGER
 */
router.get('/docs', swaggerUi.setup(swaggerSpec))

/**
 * AUTH
 */
router.post('/auth/create', authCreate)
router.post('/auth/confirmation', confirmUser)
router.post('/auth', auth)

/**
 * USERS
 */
router.get('/users', getAllUsers)
router.get('/me', getMyUserOnly)
router.put('/users/:id', editAccountById)

export default router
