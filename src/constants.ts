export const KEY_LIFETIME = Number(process.env.KEY_LIFETIME) || 5; // 5 days
export const GET_RATE_LIMIT = Number(process.env.GET_RATE_LIMIT) || 100; // 100 tries per 15 minutes
export const SET_RATE_LIMIT = Number(process.env.SET_RATE_LIMIT) || 100; // 100 tries per 15 minutes
export const DEL_RATE_LIMIT = Number(process.env.DEL_RATE_LIMIT) || 100; // 100 tries per 15 minutes
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
