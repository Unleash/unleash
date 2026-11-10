import pg from 'pg';
import { DbLockActionTimeoutError, withDbLock } from './db-lock.js';
import { getDbConfig } from '../../test/e2e/helpers/database-config.js';
import noLoggerProvider from '../../test/fixtures/no-logger.js';
import type { IDBOption } from '../types/index.js';
import type { Logger } from '../logger.js';

const { Client } = pg;

const dbConfig = getDbConfig() as IDBOption;

let loggedErrors: string[] = [];
const recordingLogger: Logger = {
    ...noLoggerProvider(),
    error(message: string) {
        loggedErrors.push(message);
    },
    fatal() {},
};

beforeEach(() => {
    loggedErrors = [];
});

const migrationThatNeverStarts = async () => {};

// advisory locks can only be unlocked by the session holding them, so the
// deliberately held lock is released by terminating its session — the same
// way production releases it: by the crashed node's death
const terminateSessionHoldingLock = async (lockKey: number) => {
    const admin = new Client(dbConfig);
    await admin.connect();
    await admin.query(
        `SELECT pg_terminate_backend(pid) FROM pg_locks WHERE locktype = 'advisory' AND objid = $1`,
        [lockKey],
    );
    await admin.end();
};

test('should lock access to any action', async () => {
    const lock = withDbLock(dbConfig);

    const asyncAction = (input: string) => Promise.resolve(`result: ${input}`);

    const result = await lock(asyncAction)('data');

    expect(result).toBe('result: data');
});

const ms = (millis: number) =>
    new Promise((resolve) => {
        setTimeout(() => resolve('time'), millis);
    });

test('should await other actions on lock', async () => {
    const lock = withDbLock(dbConfig);

    const slowActionDurationMs = 200;
    const slowActionHeadStartMs = 100;

    const results: string[] = [];
    const slowAsyncAction = (input: string) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                results.push(input);
                resolve(input);
            }, slowActionDurationMs);
        });
    };
    const fastAction = async (input: string) => {
        results.push(input);
    };

    const lockedAction = lock(slowAsyncAction);
    const lockedAnotherAction = lock(fastAction);

    // deliberately skipped await to simulate another server running slow operation
    lockedAction('first');
    // start fast action after slow action established DB connection
    await ms(slowActionHeadStartMs);
    await lockedAnotherAction('second');

    expect(results).toStrictEqual(['first', 'second']);
});

test('gives up waiting for the lock after lockTimeout instead of hanging startup on a stuck peer', async () => {
    const holderKeepsLockForMs = 500;
    const holderHeadStartMs = 100;
    // must run out while the holder still holds the lock:
    // holderHeadStartMs + peerGivesUpAfterMs < holderKeepsLockForMs
    const peerGivesUpAfterMs = 100;

    const holdingLock = withDbLock(dbConfig)(() => ms(holderKeepsLockForMs));
    const peerWithShortLockTimeout = withDbLock(dbConfig, {
        lockTimeout: peerGivesUpAfterMs,
        logger: recordingLogger,
    });

    const holder = holdingLock();
    await ms(holderHeadStartMs); // let the holder acquire the lock first

    await expect(
        peerWithShortLockTimeout(migrationThatNeverStarts)(),
    ).rejects.toThrow('canceling statement due to lock timeout');
    expect(loggedErrors).toContain(
        'Locking error: canceling statement due to lock timeout',
    );

    await holder;
});

test('releases the lock when the migration fails, so a peer can retry', async () => {
    const lock = withDbLock(dbConfig, {
        logger: recordingLogger,
    });

    const failingMigration = async () => {
        throw new Error('migration failed');
    };

    await expect(lock(failingMigration)()).rejects.toThrow('migration failed');
    expect(loggedErrors).toContain('Locking error: migration failed');

    const enoughTimeToAcquireFreeLockMs = 1000;
    const peer = withDbLock(dbConfig, {
        lockTimeout: enoughTimeToAcquireFreeLockMs,
        logger: recordingLogger,
    });
    const result = await peer(async () => 'peer migrated')();
    expect(result).toBe('peer migrated');
});

test('throws a fatal timeout error on migration timeout without releasing the lock, so no peer can migrate concurrently', async () => {
    const lockKey = 1;
    const migrationTimeoutMs = 10;
    const peerGivesUpAfterMs = 100;
    try {
        const lock = withDbLock(dbConfig, {
            lockKey,
            timeout: migrationTimeoutMs,
            logger: recordingLogger,
        });

        const neverFinishingMigration = () => new Promise<never>(() => {});

        await expect(lock(neverFinishingMigration)()).rejects.toThrow(
            DbLockActionTimeoutError,
        );
        expect(loggedErrors).toContainEqual(
            expect.stringContaining(
                `db lock timed out after ${migrationTimeoutMs}ms`,
            ),
        );

        const peer = withDbLock(dbConfig, {
            lockKey,
            lockTimeout: peerGivesUpAfterMs,
            logger: recordingLogger,
        });
        await expect(peer(migrationThatNeverStarts)()).rejects.toThrow(
            'canceling statement due to lock timeout',
        );
    } finally {
        await terminateSessionHoldingLock(lockKey);
    }
});
