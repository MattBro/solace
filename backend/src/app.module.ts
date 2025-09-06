import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_FILTER } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { AdvocatesModule } from './advocates/advocates.module';
import { AppController } from './app.controller';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60000, // 1 minute
      max: 100, // maximum number of items in cache
    }),
    DatabaseModule,
    AdvocatesModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}