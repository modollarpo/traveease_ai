import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NDPRLoggerService {
  private readonly logger = new Logger('NDPRLogger');

  maskPII(data: any): any {
    if (!data || typeof data !== 'object') return data;
    const masked = { ...data };
    ['passport', 'name', 'card', 'credit_card', 'email'].forEach((field) => {
      if (masked[field]) masked[field] = '***MASKED***';
    });
    return masked;
  }

  info(message: string, data?: any) {
    this.logger.log(`${message} | ${JSON.stringify(this.maskPII(data))}`);
  }

  error(message: string, data?: any) {
    this.logger.error(`${message} | ${JSON.stringify(this.maskPII(data))}`);
  }
}
