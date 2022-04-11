import {
    IRequestGetBody,
    IRequestSetBody,
    IRequestDelBody
} from '@zenotta/zenotta-js';
import { Request, Response, NextFunction } from 'express';

export const EMPTY_REQUEST_GET_BODY: IRequestGetBody = {
    key: '',
    publicKey: '',
    signature: ''
};

export const EMPTY_REQUEST_SET_BODY: IRequestSetBody<object> = {
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
