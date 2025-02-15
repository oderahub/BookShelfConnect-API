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
