import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ClusterService } from './libs/cluster.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      connectionTimeout: 10000,
      requestTimeout: 15000,
      keepAliveTimeout: 15000,
    }),
  );

  await app.listen(80, '0.0.0.0');
}

ClusterService.register(4, bootstrap);
