import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { config } from 'dotenv';
import { env } from 'process';

config();

@Module({
  imports: [
    ElasticsearchModule.register({
      node: env.ELASTIC_URL,
      auth: {
        username: env.ELASTIC_USERNAME,
        password: env.ELASTIC_PASSWORD,
      },
    }),
  ],
  exports: [ElasticsearchModule],
})
export class SearchModule {}
