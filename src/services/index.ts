/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { getAddressVersion } from '@zenotta/zenotta-js';
import { IS_PRODUCTION, KEY_LIFETIME } from '../constants';
import { redisClient } from '../db';
import {
    EMPTY_REQUEST_DEL_BODY,
    EMPTY_REQUEST_GET_BODY,
    EMPTY_REQUEST_SET_BODY,
    IRedisFieldEntry,
    IRequestDelBody,
    IRequestGetBody,
    IRequestSetBody
} from '../interfaces';
import logger from '../logger';
import { isOfType, verifySignature } from '../utils';
import { HTTP400Error, HTTP401Error } from '../utils/httpErrors';

const log = logger(module.filename.split('/').slice(-3).join('/'));
const SIGNATURE_FAILED = 'Signature validation failed';
const INVALID_REQUEST_BODY = 'Invalid request body';

const logHttpReq = (req: Request) => {
    log.info(
        `POST req from ${req.ip}\n Headers: ${JSON.stringify(
            req.headers
        )}\n Body: ${JSON.stringify(req.body)}\n Query: ${JSON.stringify(
            req.query
        )}\n Params: ${JSON.stringify(req.params)}`
    );
};

export const authenticateSet = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    const requestBody = req.body as IRequestSetBody[];
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
                throw new Error(SIGNATURE_FAILED);
        }
        next();
    } catch (error) {
        throw new HTTP401Error(`${error}`);
    }
};

export const authenticateGet = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    const requestBody = req.body as IRequestGetBody[];
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
                throw new Error(SIGNATURE_FAILED);
        }
        next();
    } catch (error) {
        throw new HTTP401Error(`${error}`);
    }
};

export const authenticateDel = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    const requestBody = req.body as IRequestDelBody[];
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
                throw new Error(SIGNATURE_FAILED);
        }
        next();
    } catch (error) {
        throw new HTTP401Error(`${error}`);
    }
};

export const verifyRequestSetBody = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    if (!IS_PRODUCTION) logHttpReq(req);
    const requestBody = req.body as IRequestSetBody[];
    for (const request of requestBody) {
        if (!isOfType<IRequestSetBody>(request, EMPTY_REQUEST_SET_BODY))
            throw new HTTP400Error(INVALID_REQUEST_BODY);
    }
    next();
};

export const verifyRequestGetBody = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    if (!IS_PRODUCTION) logHttpReq(req);
    const requestBody = req.body as IRequestGetBody[];
    for (const request of requestBody) {
        if (!isOfType<IRequestGetBody>(request, EMPTY_REQUEST_GET_BODY))
            throw new HTTP400Error(INVALID_REQUEST_BODY);
    }
    next();
};
export const verifyRequestDelBody = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    if (!IS_PRODUCTION) logHttpReq(req);
    const requestBody = req.body as IRequestDelBody[];
    for (const request of requestBody) {
        if (!isOfType<IRequestDelBody>(request, EMPTY_REQUEST_DEL_BODY))
            throw new HTTP400Error(INVALID_REQUEST_BODY);
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
    const reqBody = req.body as IRequestSetBody[];
    for (const request of reqBody) {
        Object.entries(await redisClient.hGetAll(request.key)).forEach(
            async ([field, value]) => {
                const parsedField = JSON.parse(value) as IRedisFieldEntry;
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
            } as IRedisFieldEntry)
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
    if (!IS_PRODUCTION) log.info(`Sending response: Ok`);
    res.status(200).send('Ok');
};

export const getDb = async (
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    const reqBody = req.body as IRequestGetBody[];
    let data: { [key: string]: string } = {};
    // First, we delete FIELD entries older than KEY_LIFETIME days
    // TODO: Convert to unix timestamp?
    for (const request of reqBody) {
        Object.entries(await redisClient.hGetAll(request.key)).forEach(
            async ([field, value]) => {
                const parsedField = JSON.parse(value) as IRedisFieldEntry;
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
    const parsedData: { [key: string]: IRedisFieldEntry } = {};
    Object.entries(data).forEach(([key, value]) => {
        parsedData[key] = JSON.parse(value) as IRedisFieldEntry;
    });
    if (!IS_PRODUCTION) log.info(`Sending response: ${JSON.stringify(data)}`);
    res.status(200).send(parsedData);
};

export const delDB = async (
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    const reqBody = req.body as IRequestDelBody[];
    // First, we delete FIELD entries older than KEY_LIFETIME days
    // TODO: Convert to unix timestamp?
    for (const request of reqBody) {
        Object.entries(await redisClient.hGetAll(request.key)).forEach(
            async ([field, value]) => {
                const parsedField = JSON.parse(value) as IRedisFieldEntry;
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
    if (!IS_PRODUCTION) log.info(`Sending response: Ok`);
    res.status(200).send('Ok');
};
