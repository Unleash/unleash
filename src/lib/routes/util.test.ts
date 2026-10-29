import type { Response } from 'express';
import type { Logger } from '../logger.js';
import { handleErrors } from './util.js';

describe('handleErrors', () => {
    it('does not crash when the error embeds a deeply-nested value', () => {
        let deep: unknown = {};
        for (let i = 0; i < 100_000; i++) {
            deep = [deep];
        }
        const error = Object.assign(new Error('boom'), { offending: deep });

        const res = {
            status: () => res,
            json: () => res,
            end: () => res,
        } as unknown as Response;
        const logger = { debug() {}, error() {} } as unknown as Logger;

        expect(() => handleErrors(res, logger, error)).not.toThrow();
    });

    it('logs the internal message without sending it to the client', () => {
        const internalMessage = 'select * from secret_table';
        let body: unknown;
        const res = {
            status: () => res,
            json: (b: unknown) => {
                body = b;
                return res;
            },
            end: () => res,
        } as unknown as Response;
        const logged: string[] = [];
        const logger = {
            debug() {},
            error: (msg: string) => logged.push(msg),
        } as unknown as Logger;

        handleErrors(res, logger, new Error(internalMessage));

        expect(logged.some((msg) => msg.includes(internalMessage))).toBe(true);
        expect(JSON.stringify(body)).not.toContain(internalMessage);
    });
});
