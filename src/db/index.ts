/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from 'redis';
import dotenv from 'dotenv';
import { logger } from '../logger';
import { REDIS_URL } from '../constants';

dotenv.config();

const redisClient = createClient({
    url: REDIS_URL
});

const init = async () => {
    new Promise((resolve, reject) => {
        redisClient.on('connect', () => {
            logger.info('Redis client connected');
            resolve(redisClient);
        });

        redisClient.on('error', (error) => {
            reject(error);
        });
        redisClient.connect();
    });
};

export { init, redisClient };
