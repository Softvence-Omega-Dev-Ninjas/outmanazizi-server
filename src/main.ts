import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './utils/common/all-exception/all-exception-filter';
import { seedSuperAdmin } from './utils/seed/seed';
import { PrismaService } from './prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: ['*'],
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('OutManAzizi Playground 🎉 — Where APIs Party')
    .setDescription(
      'Your favorite API playground! Hit the routes, explore the endpoints, and enjoy the ride 😄🎯',
    )
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

  SwaggerModule.setup('api', app, document);

  // Seed super admin user
  const prismaService = app.get(PrismaService);
  const configService = app.get(ConfigService);
  await seedSuperAdmin(prismaService, configService);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
