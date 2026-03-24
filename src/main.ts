import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger, ValidationPipe } from "@nestjs/common";
import { AllExceptionsFilter } from "./utils/common/all-exception/all-exception-filter";
import { join } from "path";
import express from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["log", "error", "warn", "debug", "verbose"],
  });
  const logger = new Logger("Bootstrap");
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: ["https://m3alem.group", "www.m3alem.group"],
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle("OutManAzizi Playground 🎉 — Where APIs Party")
    .setDescription(
      "Your favorite API playground! Hit the routes, explore the endpoints, and enjoy the ride 😄🎯",
    )
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        in: "bearer",
      },
      "access-token",
    )
    .build();

  const public_dir = join(process.cwd(), "public");
  const upload_dir = join(process.cwd(), "uploads");
  app.use("/", express.static(public_dir));
  app.use("/uploads", express.static(upload_dir));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const document = SwaggerModule.createDocument(app, config);
  document.paths = Object.fromEntries(
    Object.entries(document.paths).map(([path, ops]) => [
      path,
      Object.fromEntries(
        Object.entries(ops).map(([method, op]) => [
          method,
          {
            ...op,
            security: [{ "access-token": [] }],
          },
        ]),
      ),
    ]),
  );

  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });



  await app.listen(process.env.PORT ?? 3000);
  logger.log(`API documentation available at http://localhost:${
    process.env.PORT ?? 3000
  }/api`);
}

bootstrap();
