export const REQUEST_WINDOW = Number(process.env.REQUEST_WINDOW) || 15; // 15 minutes
export const KEY_LIFETIME = Number(process.env.KEY_LIFETIME) || 5; // 5 days
export const GET_RATE_LIMIT = Number(process.env.GET_RATE_LIMIT) || 100; // 100 tries per window
export const SET_RATE_LIMIT = Number(process.env.SET_RATE_LIMIT) || 100; // 100 tries per window
export const DEL_RATE_LIMIT = Number(process.env.DEL_RATE_LIMIT) || 100; // 100 tries per window
export const SERVER_PORT = Number(process.env.SERVER_PORT) || 3002;
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const BODY_LIMIT = process.env.BODY_LIMIT || '50kb';

export const ALL_CONSTS: { [key: string]: string | number | boolean } = {
    REQUEST_WINDOW: REQUEST_WINDOW,
    KEY_LIFETIME: KEY_LIFETIME,
    GET_RATE_LIMIT: GET_RATE_LIMIT,
    SET_RATE_LIMIT: SET_RATE_LIMIT,
    DEL_RATE_LIMIT: DEL_RATE_LIMIT,
    SERVER_PORT: SERVER_PORT,
    IS_PRODUCTION: IS_PRODUCTION,
    REDIS_URL: REDIS_URL,
    BODY_LIMIT: BODY_LIMIT
};
