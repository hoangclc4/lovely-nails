import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface PaginatedPayload<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

function isPaginatedPayload<T>(value: unknown): value is PaginatedPayload<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'meta' in value &&
    Array.isArray((value as PaginatedPayload<T>).data) &&
    typeof (value as PaginatedPayload<T>).meta === 'object'
  );
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<unknown> {
    return next.handle().pipe(
      map((value) => {
        if (isPaginatedPayload(value)) {
          return { success: true, data: value.data, meta: value.meta };
        }
        return { success: true, data: value };
      }),
    );
  }
}
