import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({ origin: true, credentials: true })

  const config = new DocumentBuilder()
    .setTitle('Foxentry API docs')
    .setDescription('[JSON API](http://foxentry-be.vercel.app/api-json)')
    .setVersion('1.0')
    .build()

  app.enableCors({ origin: true, credentials: true })

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Foxentry API Documentation',
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
    ],
  })

  await app.listen(3000)
}
bootstrap()
