import pg from 'pg';
const { Client } = pg;
import type { IDBOption } from '../types/index.js';
import type { Logger } from '../logger.js';
import { cloneDbConfig } from './clone-db-config.js';

export const defaultLockKey = 479341;
export const defaultTimeout = 30 * 60000;

export class DbLockActionTimeoutError extends Error {
    constructor(timeout: number) {
        super(
            `The action holding the db lock timed out after ${timeout}ms and is still running. ` +
                'The lock stays held; only terminating the process releases it safely.',
        );
        this.name = 'DbLockActionTimeoutError';
    }
}

interface IDbLockOptions {
    timeout: number;
    lockTimeout: number;
    lockKey: number;
    logger: Logger;
}

const defaultOptions: IDbLockOptions = {
    timeout: defaultTimeout,
    lockTimeout: defaultTimeout,
    lockKey: defaultLockKey,
    logger: { ...console, fatal: console.error },
};

export const withDbLock = (
    dbConfig: IDBOption,
    options: Partial<IDbLockOptions> = {},
) => {
    const config = { ...defaultOptions, ...options };
    return <A extends any[], R>(fn: (...args: A) => Promise<R>) =>
        async (...args: A): Promise<R> => {
            const client = new Client(cloneDbConfig(dbConfig));
            client.on('error', (e) => {
                config.logger.error(`Locking connection error: ${e.message}`);
            });
            let timedOut = false;
            let timer: NodeJS.Timeout | undefined;
            try {
                await client.connect();
                // wait time for lock acquisition
                await client.query(
                    `SELECT set_config('lock_timeout', $1, false)`,
                    [config.lockTimeout],
                );
                await client.query('SELECT pg_advisory_lock($1)', [
                    config.lockKey,
                ]);

                const timeoutPromise = new Promise<never>((_, reject) => {
                    timer = setTimeout(() => {
                        timedOut = true;
                        reject(new DbLockActionTimeoutError(config.timeout));
                    }, config.timeout);
                });
                return await Promise.race([fn(...args), timeoutPromise]);
            } catch (e) {
                config.logger.error(`Locking error: ${e.message}`);
                throw e;
            } finally {
                clearTimeout(timer);
                // disconnecting releases the session-scoped advisory lock.
                // on timeout fn is still running, so stay connected to keep the
                // lock held until the process dies
                if (!timedOut) {
                    await client.end();
                }
            }
        };
};
