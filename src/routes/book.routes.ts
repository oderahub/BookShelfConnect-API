import { Router } from 'express'
import { BookController } from '../controllers/book.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import { bookSchemas } from '../validations/schemas'

const router = Router()
const controller = new BookController()

router.get('/', controller.findAll.bind(controller))
router.get('/search', validate(bookSchemas.search), controller.searchByTitle.bind(controller))
router.get('/:id', controller.findById.bind(controller))
router.post('/', authMiddleware, validate(bookSchemas.create), controller.create.bind(controller))

export default router
