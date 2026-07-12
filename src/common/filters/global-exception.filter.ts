import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'object' && body !== null && 'message' in body) {
        message = (body as any).message;
      } else if (typeof body === 'string') {
        message = body;
      } else {
        message = exception.message;
      }
    }

    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          // Handle duplicate records caused by database unique constraints.
          statusCode = HttpStatus.CONFLICT;
          message = 'This service is already booked for the selected date and time.';
          break;

        case 'P2025':
          statusCode = HttpStatus.NOT_FOUND;
          message = 'The requested record was not found';
          break;

        default:
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Database request error';
          break;
      }
      this.logger.error(
        `Prisma error [${exception.code}]: ${exception.message}`,
      );
    }
    else {
      this.logger.error('Unhandled exception', exception);
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
