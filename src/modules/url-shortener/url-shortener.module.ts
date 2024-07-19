import { Module } from '@nestjs/common';
import { UrlShortenerController } from './url-shortener/url-shortener.controller';
import { UrlShortenerService } from './url-shortener/url-shortener.service';
import { RedisService } from './url-shortener/redis/redis';

@Module({
  controllers: [UrlShortenerController],
  providers: [UrlShortenerService, RedisService]
})
export class UrlShortenerModule { }
