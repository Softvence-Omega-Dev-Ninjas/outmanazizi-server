import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Outmanazizi Server')
    .setDescription('Project API docs')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'bearer',
      },
      'access-token',
    )
    .build();

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true })); // to ensure DTO validation works everywhere.

  const document = SwaggerModule.createDocument(app, config);
  document.paths = Object.fromEntries(
    Object.entries(document.paths).map(([path, ops]) => [
      path,
      Object.fromEntries(
        Object.entries(ops).map(([method, op]) => [
          method,
          {
            ...op,
            security: [{ 'access-token': [] }],
          },
        ]),
      ),
    ]),
  );

  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
