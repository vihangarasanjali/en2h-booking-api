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

    // ── 1. NestJS HttpExceptions (NotFoundException, BadRequestException, etc.) ──
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();

      // ValidationPipe returns { message: string[] } for validation errors
      if (typeof body === 'object' && body !== null && 'message' in body) {
        message = (body as any).message;
      } else if (typeof body === 'string') {
        message = body;
      } else {
        message = exception.message;
      }
    }

    // ── 2. Prisma known request errors ────────────────────────────────────────
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          // Unique constraint violation — most likely a duplicate booking slot (race condition)
          statusCode = HttpStatus.CONFLICT;
          message = 'This service is already booked for the selected date and time.';
          break;

        case 'P2025':
          // Record not found
          statusCode = HttpStatus.NOT_FOUND;
          message = 'The requested record was not found';
          break;

        default:
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Database request error';
          break;
      }
      // Log with code for debugging but don't expose details to client
      this.logger.error(
        `Prisma error [${exception.code}]: ${exception.message}`,
      );
    }

    // ── 3. Catch-all for unexpected errors ────────────────────────────────────
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
