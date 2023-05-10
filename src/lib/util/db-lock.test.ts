import { withDbLock } from './db-lock';
import { getDbConfig } from '../../test/e2e/helpers/database-config';
import { IDBOption } from '../types';
import { Logger } from '../logger';

test('should lock access to any action', async () => {
    const lock = withDbLock(getDbConfig() as IDBOption);

    const asyncAction = (input: string) => Promise.resolve(`result: ${input}`);

    const result = await lock(asyncAction)('data');

    expect(result).toBe('result: data');
});

const ms = (millis: number) =>
    new Promise((resolve) => {
        setTimeout(() => resolve('time'), millis);
    });

test('should await other actions on lock', async () => {
    const lock = withDbLock(getDbConfig() as IDBOption);

    const results: string[] = [];
    const slowAsyncAction = (input: string) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                results.push(input);
                resolve(input);
            }, 200);
        });
    };
    const fastAction = async (input: string) => {
        results.push(input);
    };

    const lockedAction = lock(slowAsyncAction);
    const lockedAnotherAction = lock(fastAction);

    // deliberately skipped await to simulate another server running slow operation
    lockedAction('first');
    await ms(100); // start fast action after slow action established DB connection
    await lockedAnotherAction('second');

    await expect(results).toStrictEqual(['first', 'second']);
});

test('should handle lock timeout', async () => {
    const timeoutMs = 1;
    let loggedError = '';
    const lock = withDbLock(getDbConfig() as IDBOption, {
        lockKey: 1,
        timeout: timeoutMs,
        logger: {
            error(msg: string) {
                loggedError = msg;
            },
        } as unknown as Logger,
    });

    // the query should fail because of the timeout. This one is a fallback when timeout
    // was not triggered in the integration test
    const asyncAction = () => Promise.reject(new Error('Query read timeout'));

    await expect(lock(asyncAction)()).rejects.toStrictEqual(
        new Error('Query read timeout'),
    );
    expect(loggedError).toBe('Locking error: Query read timeout');
});
