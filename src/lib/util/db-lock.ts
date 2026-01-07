import pg from 'pg';
const { Client } = pg;
import type { IDBOption } from '../types/index.js';
import type { Logger } from '../logger.js';

export const defaultLockKey = 479341;
export const defaultTimeout = 30 * 60000;

interface IDbLockOptions {
    timeout: number;
    lockKey: number;
    logger: Logger;
}

const defaultOptions: IDbLockOptions = {
    timeout: defaultTimeout,
    lockKey: defaultLockKey,
    logger: { ...console, fatal: console.error },
};

export const withDbLock =
    (dbConfig: IDBOption, config = defaultOptions) =>
    <A extends any[], R>(fn: (...args: A) => Promise<R>) =>
    async (...args: A): Promise<R> => {
        const client = new Client({
            ...dbConfig,
        });
        let lockAcquired = false;
        try {
            await client.connect();
            // wait to obtain a lock
            await client.query('SELECT pg_advisory_lock($1)', [config.lockKey]);
            lockAcquired = true;

            const promise = fn(...args);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(
                    () => reject(new Error('Query read timeout')),
                    config.timeout,
                ),
            );
            const result = (await Promise.race([promise, timeoutPromise])) as R;
            return result;
        } catch (e) {
            config.logger.error(`Locking error: ${e.message}`);
            throw e;
        } finally {
            if (lockAcquired) {
                await client.query('SELECT pg_advisory_unlock($1)', [
                    config.lockKey,
                ]);
            }
            await client.end();
        }
    };
