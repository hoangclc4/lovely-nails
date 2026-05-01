import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { Logger } from 'nestjs-pino';

const HTTP_ERROR_CODE = 'HTTP_ERROR';
const INTERNAL_ERROR_CODE = 'INTERNAL_SERVER_ERROR';
const VALIDATION_ERROR_CODE = 'VALIDATION_ERROR';
const GENERIC_ERROR_MESSAGE = 'An unexpected error occurred';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const message =
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse &&
        typeof (exceptionResponse as Record<string, unknown>)['message'] === 'string'
          ? (exceptionResponse as Record<string, unknown>)['message']
          : exception.message;

      const errors =
        typeof exceptionResponse === 'object' && 'errors' in exceptionResponse
          ? (exceptionResponse as Record<string, unknown>)['errors']
          : undefined;

      reply.status(status).send({
        success: false,
        error: {
          code: HTTP_ERROR_CODE,
          message: message as string,
          ...(errors !== undefined && { errors }),
        },
      });
      return;
    }

    if (exception instanceof ZodError) {
      reply.status(HttpStatus.BAD_REQUEST).send({
        success: false,
        error: {
          code: VALIDATION_ERROR_CODE,
          message: 'Validation failed',
          errors: exception.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
      });
      return;
    }

    this.logger.error(exception, 'Unhandled exception');

    reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: INTERNAL_ERROR_CODE,
        message: GENERIC_ERROR_MESSAGE,
      },
    });
  }
}
