/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import {
    getAddressVersion,
    IRedisFieldEntry,
    IRequestIntercomDelBody,
    IRequestIntercomGetBody,
    IRequestIntercomSetBody
} from '@zenotta/zenotta-js';
import { IS_PRODUCTION, KEY_LIFETIME } from '../constants';
import { redisClient } from '../db';
import {
    EMPTY_REQUEST_DEL_BODY,
    EMPTY_REQUEST_GET_BODY,
    EMPTY_REQUEST_SET_BODY
} from '../interfaces';
import logger from '../logger';
import { isOfType, verifySignature } from '../utils';
import createHttpError from 'http-errors';

const log = IS_PRODUCTION
    ? logger()
    : logger(module.filename.split('/').slice(-3).join('/'));

const SIGNATURE_FAILED = 'Signature validation failed';
const INVALID_REQUEST_BODY = 'Invalid request body';

const logHttpReq = (req: Request) => {
    log.info(
        `POST req from ${req.ip}\n Headers: ${JSON.stringify(
            req.headers
        )}\n Body: ${JSON.stringify(req.body)}\n Query: ${JSON.stringify(
            req.query
        )}\n Params: ${JSON.stringify(req.params)}\n URL: ${req.originalUrl}`
    );
};

export const authenticateSet = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    const requestBody = req.body as IRequestIntercomSetBody<object>[];
    try {
        for (const request of requestBody) {
            if (
                !verifySignature(
                    request.field,
                    request.signature,
                    request.publicKey
                ) ||
                getAddressVersion(
                    Uint8Array.from(Buffer.from(request.publicKey, 'hex')),
                    request.field
                ).isErr()
            )
                return next(createHttpError(401, SIGNATURE_FAILED));
        }
        next();
    } catch (error) {
        return next(createHttpError(400, INVALID_REQUEST_BODY));
    }
};

export const authenticateGet = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    const requestBody = req.body as IRequestIntercomGetBody[];
    try {
        for (const request of requestBody) {
            if (
                !verifySignature(
                    request.key,
                    request.signature,
                    request.publicKey
                ) ||
                getAddressVersion(
                    Uint8Array.from(Buffer.from(request.publicKey, 'hex')),
                    request.key
                ).isErr()
            )
                return next(createHttpError(401, SIGNATURE_FAILED));
        }
        next();
    } catch (error) {
        return next(createHttpError(400, INVALID_REQUEST_BODY));
    }
};

export const authenticateDel = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    const requestBody = req.body as IRequestIntercomDelBody[];
    try {
        for (const request of requestBody) {
            if (
                !verifySignature(
                    request.key,
                    request.signature,
                    request.publicKey
                ) ||
                getAddressVersion(
                    Uint8Array.from(Buffer.from(request.publicKey, 'hex')),
                    request.key
                ).isErr()
            )
                return next(createHttpError(401, SIGNATURE_FAILED));
        }
        next();
    } catch (error) {
        return next(createHttpError(400, INVALID_REQUEST_BODY));
    }
};

export const verifyRequestSetBody = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    if (!IS_PRODUCTION) logHttpReq(req);
    if (!Array.isArray(req.body))
        return next(createHttpError(400, INVALID_REQUEST_BODY));
    const requestBody = req.body as IRequestIntercomSetBody<object>[];
    for (const request of requestBody) {
        if (
            !isOfType<IRequestIntercomSetBody<object>>(
                request,
                EMPTY_REQUEST_SET_BODY
            )
        )
            return next(createHttpError(400, INVALID_REQUEST_BODY));
    }
    next();
};

export const verifyRequestGetBody = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    if (!IS_PRODUCTION) logHttpReq(req);
    if (!Array.isArray(req.body))
        return next(createHttpError(400, INVALID_REQUEST_BODY));
    const requestBody = req.body as IRequestIntercomGetBody[];
    for (const request of requestBody) {
        if (!isOfType<IRequestIntercomGetBody>(request, EMPTY_REQUEST_GET_BODY))
            return next(createHttpError(400, INVALID_REQUEST_BODY));
    }
    next();
};

export const verifyRequestDelBody = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    if (!IS_PRODUCTION) logHttpReq(req);
    if (!Array.isArray(req.body))
        return next(createHttpError(400, INVALID_REQUEST_BODY));
    const requestBody = req.body as IRequestIntercomDelBody[];
    for (const request of requestBody) {
        if (!isOfType<IRequestIntercomDelBody>(request, EMPTY_REQUEST_DEL_BODY))
            return next(createHttpError(400, INVALID_REQUEST_BODY));
    }
    next();
};

export const setDb = async (
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    // First, we delete FIELD entries older than KEY_LIFETIME days
    // TODO: Convert to unix timestamp?
    const reqBody = req.body as IRequestIntercomSetBody<object>[];
    for (const request of reqBody) {
        Object.entries(await redisClient.hGetAll(request.key)).forEach(
            async ([field, value]) => {
                const parsedField = JSON.parse(
                    value
                ) as IRedisFieldEntry<object>;
                if (
                    (new Date().getTime() -
                        new Date(parsedField.timestamp).getTime()) /
                        (1000 * 3600 * 24) >
                    KEY_LIFETIME
                ) {
                    await redisClient.hDel(request.key, field);
                }
            }
        );
        await redisClient.hSet(
            request.key,
            request.field,
            JSON.stringify({
                timestamp: new Date().getTime(),
                value: request.value
            } as IRedisFieldEntry<object>)
        );
        await redisClient.expireAt(
            request.key,
            new Date().setDate(
                new Date().getDate() + KEY_LIFETIME
            ) /* KEY value will expire KEY_LIFETIME days from now */
        );

        /* Remove this to enable exchanging data from and to the same address */
        if (request.field !== request.key)
            await redisClient.hDel(request.field, request.key);
    }
    log.info(`Sending response: Ok`);
    res.status(200).send('Ok');
};

export const getDb = async (
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    const reqBody = req.body as IRequestIntercomGetBody[];
    let data: { [key: string]: string } = {};
    // First, we delete FIELD entries older than KEY_LIFETIME days
    // TODO: Convert to unix timestamp?
    for (const request of reqBody) {
        Object.entries(await redisClient.hGetAll(request.key)).forEach(
            async ([field, value]) => {
                const parsedField = JSON.parse(
                    value
                ) as IRedisFieldEntry<object>;
                if (
                    (new Date().getTime() -
                        new Date(parsedField.timestamp).getTime()) /
                        (1000 * 3600 * 24) >
                    KEY_LIFETIME
                ) {
                    await redisClient.hDel(request.key, field);
                }
            }
        );
        data = { ...data, ...(await redisClient.hGetAll(request.key)) };
    }
    const parsedData: { [key: string]: IRedisFieldEntry<object> } = {};
    Object.entries(data).forEach(([key, value]) => {
        parsedData[key] = JSON.parse(value) as IRedisFieldEntry<object>;
    });
    log.info(`Sending response: ${JSON.stringify(data)}`);
    res.status(200).send(parsedData);
};

export const delDB = async (
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    const reqBody = req.body as IRequestIntercomDelBody[];
    // First, we delete FIELD entries older than KEY_LIFETIME days
    // TODO: Convert to unix timestamp?
    for (const request of reqBody) {
        Object.entries(await redisClient.hGetAll(request.key)).forEach(
            async ([field, value]) => {
                const parsedField = JSON.parse(
                    value
                ) as IRedisFieldEntry<object>;
                if (
                    (new Date().getTime() -
                        new Date(parsedField.timestamp).getTime()) /
                        (1000 * 3600 * 24) >
                    KEY_LIFETIME
                ) {
                    await redisClient.hDel(request.key, field);
                }
            }
        );
        await redisClient.hDel(request.key as string, request.field as string);
    }
    log.info(`Sending response: Ok`);
    res.status(200).send('Ok');
};
