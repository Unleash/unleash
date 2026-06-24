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
});
