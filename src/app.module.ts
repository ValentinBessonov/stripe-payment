import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot()
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
