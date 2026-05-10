import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

process.env['TZ'] = 'Pacific/Guam';

const API_PREFIX = 'api/v1';
const SWAGGER_PATH = 'api/docs';
const SWAGGER_TITLE = 'Lovely Nails API';
const SWAGGER_DESCRIPTION = 'Nail salon management system API';
const SWAGGER_VERSION = '1.0';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );

  const corsOrigin = process.env['CORS_ORIGIN'] ?? '*';
  const allowedOrigins = corsOrigin === '*' ? '*' : corsOrigin.split(',').map((o) => o.trim());

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: allowedOrigins !== '*',
  });

  const logger = app.get(Logger);
  app.useLogger(logger);

  app.setGlobalPrefix(API_PREFIX);

  app.useGlobalFilters(new GlobalExceptionFilter(logger));
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle(SWAGGER_TITLE)
    .setDescription(SWAGGER_DESCRIPTION)
    .setVersion(SWAGGER_VERSION)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(SWAGGER_PATH, app, document);

  const port = process.env['PORT'] ?? 3100;
  await app.listen(port, '0.0.0.0');

  logger.log(`Application running on port ${port}`, 'Bootstrap');
}

void bootstrap();
