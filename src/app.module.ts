import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user/user.service';
import { CountUserService } from './count-user/count-user.service';
import { CountUserController } from './count-user/count-user.controller';
import { UserController } from './user/user.controller';
import { VerifyCacheMiddleware } from './middlewares/verify-cache';
import { APP_PIPE } from '@nestjs/core';

@Module({
  controllers: [UserController, CountUserController],
  providers: [
    UserService,
    CountUserService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VerifyCacheMiddleware).forRoutes('/pessoas/:id');
  }
}
