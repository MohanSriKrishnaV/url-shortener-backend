import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import baseX from 'base-x';
import { RedisService } from './redis/redis';
import validator from 'validator';  // Import the validator library

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62 = baseX(BASE62);
@Injectable()
export class UrlShortenerService {
    private redisClient = this.redisService.getClient();

    constructor(private readonly redisService: RedisService) { }

    // Generate a unique short URL for a given long URL
    private async generateUniqueShortUrl(longUrl: string): Promise<string> {
        // Generate a hash from the long URL
        const hash = CryptoJS.MD5(longUrl).toString(CryptoJS.enc.Hex);
        // Encode the hash to base62 and trim to 6 characters
        return base62.encode(Buffer.from(hash, 'hex')).slice(0, 6);
    }

    // Check if a short URL is unique
    private async isShortUrlUnique(shortUrl: string): Promise<boolean> {
        try {
            const longUrl = await this.redisClient.get(shortUrl);
            return !longUrl;
        } catch (error) {
            console.error('Error checking short URL uniqueness:', error);
            throw new Error('Internal server error');
        }
    }

    // Find short URL by long URL
    async findShortUrlByLongUrl(longUrl: string): Promise<string | null> {
        try {
            const shortUrl = await this.redisClient.get(longUrl);
            return shortUrl;
        } catch (error) {
            console.error('Error finding short URL by long URL:', error);
            throw new Error('Internal server error');
        }
    }

    // Shorten a given long URL
    async shortenUrl(longUrl: string): Promise<string> {
        if (!this.isValidUrl(longUrl)) {
            throw new Error('Invalid URL format');
        }

        try {
            const existingShortUrl = await this.findShortUrlByLongUrl(longUrl);
            if (existingShortUrl) {
                return existingShortUrl;
            }

            let shortUrl;
            do {
                shortUrl = await this.generateUniqueShortUrl(longUrl);
            } while (!(await this.isShortUrlUnique(shortUrl)));

            await this.redisClient.set(longUrl, shortUrl, 'EX', 60 * 60 * 24 * 365);
            await this.redisClient.set(shortUrl, longUrl, 'EX', 60 * 60 * 24 * 365);
            return shortUrl;
        } catch (error) {
            console.error('Error shortening URL:', error);
            throw new Error('Internal server error');
        }
    }

    // Retrieve the long URL from a short URL
    async getLongUrl(shortUrl: string): Promise<string | null> {
        try {
            return await this.redisClient.get(shortUrl);
        } catch (error) {
            console.error('Error retrieving long URL:', error);
            throw new Error('Internal server error');
        }
    }


    // Validate a given URL
    isValidUrl(url: string): boolean {
        // Check if the URL is valid and has a proper scheme
        return validator.isURL(url, {
            protocols: ['http', 'https'],
            require_protocol: true,
            require_host: true,
            require_valid_protocol: true,
            require_tld: true
        });
    }
}
