// src/redis/redis.service.ts
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';  // Default import

@Injectable()
export class RedisService {
    private client: Redis;  // Use Redis as type here

    constructor() {
        this.client = new Redis({
            host: 'localhost',  // Replace with your Redis server host
            port: 6379,         // Replace with your Redis server port
        });
    }

    getClient(): Redis {
        return this.client;
    }
}
