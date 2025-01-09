import * as Router from '@koa/router'
import { auth, authCreate } from './auth'
import { editAccountById } from './user'

const router = new Router()

/**
 * AUTH
 */
router.post('/auth/create', authCreate);
router.post('/auth', auth);

/**
 * USERS
 */
router.put('/users/:id', editAccountById)

export default router
