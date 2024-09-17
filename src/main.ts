import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { default as hbs } from 'hbs';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';
import { seed } from './modules/prisma/seed';

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
    .addServer(process.env.HOST, 'Local environment')
    .addServer('https://staging.yourapi.com/', 'Staging')
    .addServer(process.env.HOST, 'Production')
    .addTag('Your API Tag')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  app.useStaticAssets(join(__dirname, '..', 'public'));
  seed();

  if (process.env.NODE_ENV != 'dev') {
    hbs.registerPartials(join(__dirname, '..', 'views'));
    SwaggerModule.setup('api', app, document, {
      customSiteTitle: 'Api Docs',
      customfavIcon:
        'https://static-00.iconduck.com/assets.00/swagger-icon-512x512-halz44im.png',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
      ],
      customCssUrl: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
      ],
    });
  }

  SwaggerModule.setup('api', app, document);
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(process.env.PORT || 8000);
}

bootstrap();
