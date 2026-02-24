import { Response as ExpressResponse } from 'express'
import { CustomError } from './custom.error'

export class AppResponse {
  public statusCode: number
  public body: string

  constructor(
    statusCode: number,
    data: string | Record<string, unknown> | unknown[],
  ) {
    this.statusCode = statusCode
    this.body = JSON.stringify(data)
  }

  public static success<T>(
    data: T,
    message: string = '',
  ): Record<string, unknown> {
    return {
      status: 'success',
      message,
      data,
    }
  }

  public static error(
    res: ExpressResponse,
    error: unknown,
    statusCode: number = 500,
  ): void {
    let responseBody: Record<string, unknown> = {}

    if (error instanceof CustomError) {
      responseBody = { error: error.message }
      statusCode = error.statusCode || 500
    } else if (error instanceof Error) {
      responseBody = { error: error.message }
    } else if (typeof error === 'string') {
      responseBody = { error: error }
    } else if (typeof error === 'object' && error !== null) {
      responseBody = error as Record<string, unknown>
    } else {
      console.error('Unknown error:', error)
      responseBody = { error: 'Unknown error' }
    }

    res.status(statusCode).json(responseBody)
  }
}
