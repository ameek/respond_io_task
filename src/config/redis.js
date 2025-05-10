import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config({ path: './src/.env' });

const redisUrl = `redis://${process.env.REDIS_PASSWORD ? `:${process.env.REDIS_PASSWORD}@` : ''}${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

await redisClient.connect();

export default redisClient;