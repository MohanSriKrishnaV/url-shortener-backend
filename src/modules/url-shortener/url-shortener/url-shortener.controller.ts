import { Body, Controller, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { UrlShortenerService } from './url-shortener.service';
import { Response } from 'express';

@Controller('url-shortener')
export class UrlShortenerController {
    constructor(private readonly urlShortenerService: UrlShortenerService) { }
    @Post('shorten')
    async shorten(@Body('longUrl') longUrl: string) {
        // Check if the long URL already has a short URL
        const existingShortUrl = await this.urlShortenerService.findShortUrlByLongUrl(longUrl);
        if (existingShortUrl) {
            return { shortUrl: existingShortUrl };
        }

        // If not, shorten the URL and return the new short URL
        const shortUrl = await this.urlShortenerService.shortenUrl(longUrl);
        return { shortUrl };
    }

    @Get(':shortUrl')
    async redirect(@Param('shortUrl') shortUrl: string, @Res() res: Response) {
        const longUrl = await this.urlShortenerService.getLongUrl(shortUrl);
        if (longUrl) {
            res.redirect(longUrl);
        } else {
            res.status(HttpStatus.NOT_FOUND).send('Not Found');
        }
    }
}
