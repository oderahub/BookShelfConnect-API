import { Router } from 'express'
import { UserController } from '../controllers/user.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import { userSchemas } from '../validations/schemas'

const router = Router()
const controller = new UserController()

router.post('/register', validate(userSchemas.register), controller.register.bind(controller))
router.post('/login', validate(userSchemas.login), controller.login.bind(controller))
router.get('/profile', authMiddleware, controller.findById.bind(controller))
router.get('/profiles', authMiddleware, controller.findAll.bind(controller))
router.put(
  '/profile',
  authMiddleware,
  validate(userSchemas.update),
  controller.update.bind(controller)
)
router.delete('/account', authMiddleware, controller.delete.bind(controller))
//router.post('/logout', authMiddleware, controller.logout.bind(controller))

export default router
