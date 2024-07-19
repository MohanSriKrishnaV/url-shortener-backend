import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UrlShortenerModule } from './modules/url-shortener/url-shortener.module';

@Module({
  imports: [UrlShortenerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
