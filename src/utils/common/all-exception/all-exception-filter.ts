import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorData: any = null;

    // Handle HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        errorData = res;
        message = (res as any).message || message;
      }
    }

    if (errorData?.message) {
      message = errorData.message;
    } else {
      switch (status) {
        case HttpStatus.UNAUTHORIZED:
          message = '🚫 You are not authorized to perform this action';
          break;
        case HttpStatus.NOT_FOUND:
          message = '❌ The requested resource was not found';
          break;
        case HttpStatus.FORBIDDEN:
          message = '⛔ Access forbidden';
          break;
        case HttpStatus.BAD_REQUEST:
          message = '⚠️ Invalid request data';
          break;
        case HttpStatus.INTERNAL_SERVER_ERROR:
          message = '⚠️ Something went wrong, please try again later';
          break;
      }
    }
    response.status(status).json({
      success: false,
      statusCode: status,
      error: errorData.message,
      details: errorData ?? null,
    });
  }
}
