/* -------------------------------------------------------------------------- */
/*                         Module For Common Utilities                        */
/* -------------------------------------------------------------------------- */

import { Router } from 'express';
import nacl from 'tweetnacl';
import { Route } from '../interfaces';

type Wrapper = (router: Router) => void;

export const applyMiddleware = (
    middlewareWrappers: Wrapper[],
    router: Router
) => {
    for (const wrapper of middlewareWrappers) {
        wrapper(router);
    }
};

export const applyRoutes = (routes: Route[], router: Router) => {
    for (const route of routes) {
        const { method, path, handler } = route;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (router as any)[method](path, handler);
    }
};

/**
 * Test to see if an object is of a specified interface type
 *
 * @template T
 * @param {*} arg
 * @param {T} testAgainst
 * @return {*}  {arg is T}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isOfType = <T>(arg: any, testAgainst: any): arg is T =>
    Object.entries(testAgainst).every(
        ([key]) => key in arg && typeof arg[key] === typeof testAgainst[key]
    );

/**
 * Verify the signature for a message
 *
 * @param {string} message
 * @param {string} signature
 * @param {string} publicKey
 * @return {*}  {boolean}
 */
export const verifySignature = (
    message: string,
    signature: string,
    publicKey: string
): boolean =>
    nacl.sign.detached.verify(
        Uint8Array.from(Buffer.from(message, 'hex')),
        Uint8Array.from(Buffer.from(signature, 'hex')),
        Uint8Array.from(Buffer.from(publicKey, 'hex'))
    );
