import { Request, Response } from 'express'
import { BaseService } from '../services/base.service'
import { BaseEntity } from '../types'
import { logger } from '../utils/logger'
import { sendError } from '../constants/error'

export abstract class BaseController<T extends BaseEntity> {
  protected service: BaseService<T>

  constructor(service: BaseService<T>) {
    this.service = service
  }

  /**
   * @openapi
   * '/books':
   *   post:
   *     summary: Create a new entity
   *     tags: [Books]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       201:
   *         description: Entity created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: 'boolean' }
   *                 data: { type: 'object' }
   *                 message: { type: 'string' }
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */

  async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.service.create(req.body)
      if (result.success) {
        res.status(201).json(result)
      } else {
        sendError(res, result.error ?? 'Creation failed', 400)
      }
    } catch (error) {
      logger.error('❌ Error in create:', error)
      sendError(res, 'Internal server error', 500)
    }
  }

  /**
   * @openapi
   * '/books/{id}':
   *   get:
   *     summary: Get an entity by ID
   *     tags: [Books]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Entity found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: 'boolean' }
   *                 data: { type: 'object' }
   *       404:
   *         description: Entity not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.service.findById(req.params.id)
      if (result.success) {
        res.status(200).json(result)
      } else {
        sendError(res, 'Record not found', 404)
      }
    } catch (error) {
      logger.debug('❌ Error in findById:', error)
      sendError(res, 'Internal server error', 500)
    }
  }

  /**
   * @openapi
   * '/books':
   *   get:
   *     summary: Get all entities
   *     tags: [ Books]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *     responses:
   *       200:
   *         description: List of entities
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: 'boolean' }
   *                 data: { type: 'array', items: { type: 'object' } }
   *       404:
   *         description: No entities found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 10

      const result = await this.service.findAll(page, limit)
      if (result.success) {
        res.status(200).json(result)
      } else {
        sendError(res, 'No records found', 404)
      }
    } catch (error) {
      logger.error('❌ Error in findAll:', error)
      sendError(res, 'Internal server error', 500)
    }
  }

  /**
   * @openapi
   * '/books/{id}':
   *   put:
   *     summary: Update an entity
   *     tags: [ Books]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Entity updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: 'boolean' }
   *                 data: { type: 'boolean' }
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */

  async update(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.service.update(req.params.id, req.body)
      if (result.success) {
        res.status(200).json(result)
      } else {
        sendError(res, result.error ?? 'Update failed', 400)
      }
    } catch (error) {
      logger.error('❌ Error in update:', error)
      sendError(res, 'Internal server error', 500)
    }
  }
  /**
   * @openapi
   * '/books/{id}':
   *   delete:
   *     summary: Delete an entity
   *     tags: [Books]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Entity deleted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: 'boolean' }
   *                 data: { type: 'boolean' }
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.service.delete(req.params.id)
      if (result.success) {
        res.status(200).json(result)
      } else {
        sendError(res, result.error ?? 'Deletion failed', 400)
      }
    } catch (error) {
      logger.error('❌ Error in delete:', error)
      sendError(res, 'Internal server error', 500)
    }
  }
}
