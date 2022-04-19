import compression from 'compression';
import express, { RequestHandler, Router } from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import {
    BODY_LIMIT,
    DEL_RATE_LIMIT,
    GET_RATE_LIMIT,
    REQUEST_WINDOW,
    SET_RATE_LIMIT
} from '../constants';

const handleCommon = (router: Router) => {
    router.use(cors());
    router.use(
        express.json({ limit: BODY_LIMIT, strict: true }) as RequestHandler
    );
    router.use(
        express.urlencoded({
            limit: BODY_LIMIT,
            extended: true
        }) as RequestHandler
    );
    router.use(compression());
};

const handleRateLimit = (router: Router) => {
    const getDataLimiter = rateLimit({
        windowMs: REQUEST_WINDOW * 60 * 1000,
        max: GET_RATE_LIMIT,
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        message: 'Too many requests, please try again later'
    });
    const setDataLimiter = rateLimit({
        windowMs: REQUEST_WINDOW * 60 * 1000,
        max: SET_RATE_LIMIT,
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        message: 'Too many requests, please try again later'
    });
    const delDataLimiter = rateLimit({
        windowMs: REQUEST_WINDOW * 60 * 1000,
        max: DEL_RATE_LIMIT,
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        message: 'Too many requests, please try again later'
    });
    router.use('/get_data', getDataLimiter);
    router.use('/set_data', setDataLimiter);
    router.use('/del_data', delDataLimiter);
};

export default [handleCommon, handleRateLimit];
