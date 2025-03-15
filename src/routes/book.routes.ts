import { Router } from 'express'
import { BookController } from '../controllers/book.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'
import { bookSchemas } from '../validations/schemas'

const router = Router()
const controller = new BookController()

router.get('/', authMiddleware, controller.findAll.bind(controller))
router.get(
  '/search',
  authMiddleware,
  validate(bookSchemas.search),
  controller.searchByTitle.bind(controller)
)
router.post('/', authMiddleware, validate(bookSchemas.create), controller.create.bind(controller))
router.put('/:id', authMiddleware, validate(bookSchemas.update), controller.update.bind(controller))
router.delete('/:id', authMiddleware, controller.delete.bind(controller))

router.post('/:id/reviews', authMiddleware, controller.addReview.bind(controller))
router.get('/:id/reviews', authMiddleware, controller.getReviews.bind(controller))

export default router
