import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { default as hbs } from 'hbs';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  const options = new DocumentBuilder()
    .setTitle('Secret Management System')
    .setDescription('Your API description')
    .setVersion('1.0')
    .addServer('http://localhost:3000/', 'Local environment')
    .addServer('https://staging.yourapi.com/', 'Staging')
    .addServer('https://production.yourapi.com/', 'Production')
    .addTag('Your API Tag')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  if (process.env.NODE_ENV != 'dev')
    hbs.registerPartials(join(__dirname, '..', 'views'));

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT || 8000);
}
bootstrap();
