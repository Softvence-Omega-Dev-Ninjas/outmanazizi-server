import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseBody: any = {
      success: false,
      error: 'Internal server error',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      if (exception instanceof UnauthorizedException) {
        responseBody = {
          success: false,
          error: 'Unauthorized access',
        };
      } else if (exception instanceof NotFoundException) {
        responseBody = {
          success: false,
          error: 'Resource not found',
        };
      } else {
        // Other HttpExceptions
        const exceptionResponse = exception.getResponse();
        responseBody = {
          success: false,
          statusCode: status,
          message:
            (typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse)
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              ? (exceptionResponse as any).message
              : exceptionResponse || exception.message,
        };
      }
    }

    response.status(status).json(responseBody);
  }
}
