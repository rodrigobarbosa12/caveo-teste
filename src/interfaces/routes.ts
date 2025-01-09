import * as Router from '@koa/router'
import { auth, authCreate } from './auth'

const router = new Router()

router.post('/auth/create', authCreate);
router.post('/auth', auth);

export default router
