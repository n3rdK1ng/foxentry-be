import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({ origin: true, credentials: true })

  const config = new DocumentBuilder()
    .setTitle('Foxentry API docs')
    // TODO: change the URL to the actual API URL
    .setDescription('[JSON API](http://localhost:3000/api-json)')
    .setVersion('1.0')
    .build()

  app.enableCors({ origin: true, credentials: true })

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Foxentry API Documentation',
  })

  await app.listen(3000)
}
bootstrap()
