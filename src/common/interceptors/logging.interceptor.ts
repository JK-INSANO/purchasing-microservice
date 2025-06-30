import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    
    const { method, url, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const clientId = headers['x-client-id'] || 'anonymous';
    
    const now = Date.now();
    
    this.logger.log(
      `Incoming Request: ${method} ${url} - Client: ${clientId} - UserAgent: ${userAgent}`,
    );

    return next.handle().pipe(
      tap(() => {
        const { statusCode } = response;
        const responseTime = Date.now() - now;
        
        this.logger.log(
          `Outgoing Response: ${method} ${url} - Status: ${statusCode} - Time: ${responseTime}ms - Client: ${clientId}`,
        );
      }),
    );
  }
}
