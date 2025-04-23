import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('FSP CUP API')
    .setDescription('FSP CUP API Documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { basePath: '/api' },
  });

  app.enableCors({
    origin: ['*'],
    credentials: true,
  });

  await app.listen(process.env.port ?? 3000);
}
bootstrap();
