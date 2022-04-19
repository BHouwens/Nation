/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from 'redis';
import dotenv from 'dotenv';
import logger from '../logger';
import { IS_PRODUCTION, REDIS_URL } from '../constants';

const log = IS_PRODUCTION
    ? logger()
    : logger(module.filename.split('/').slice(-3).join('/'));

dotenv.config();

const redisClient = createClient({
    url: REDIS_URL
});

const init = async () => {
    new Promise((resolve, reject) => {
        redisClient.on('connect', () => {
            log.info('Redis client connected');
            resolve(redisClient);
        });

        redisClient.on('error', (error) => {
            reject(error);
        });
        redisClient.connect();
    });
};

export { init, redisClient };
