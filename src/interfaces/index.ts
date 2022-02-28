import { Request, Response, NextFunction } from 'express';

export type IRequestGetBody = {
    key: string;
    publicKey: string;
    signature: string;
};

export type IRequestSetBody = {
    key: string;
    field: string;
    publicKey: string;
    signature: string;
    value: object;
};

export type IRequestDelBody = {
    key: string;
    field: string;
    publicKey: string;
    signature: string;
};

export type IRedisFieldEntry = {
    timestamp: number;
    value: object;
};

export const EMPTY_REQUEST_GET_BODY: IRequestGetBody = {
    key: '',
    publicKey: '',
    signature: ''
};

export const EMPTY_REQUEST_SET_BODY: IRequestSetBody = {
    key: '',
    field: '',
    publicKey: '',
    signature: '',
    value: {}
};

export const EMPTY_REQUEST_DEL_BODY: IRequestDelBody = {
    key: '',
    field: '',
    publicKey: '',
    signature: ''
};

export type Handler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void> | void;

export type Route = {
    path: string;
    method: string;
    handler: Handler | Handler[];
};
