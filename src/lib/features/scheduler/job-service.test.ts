import { createTestConfig } from '../../../test/config/test-config.js';
import { JobStore } from './job-store.js';
import { JobService } from './job-service.js';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import { subMinutes } from 'date-fns';

let db: ITestDb;
let store: JobStore;
const config = createTestConfig();
beforeAll(async () => {
    db = await dbInit('job_service_serial', config.getLogger);
    // @ts-expect-error setMuteError is not part of getLogger interface
    config.getLogger.setMuteError(true);
    store = new JobStore(db.rawDatabase, config);
});

afterEach(async () => {
    await store.deleteAll();
});

afterAll(async () => {
    await db.destroy();
});

// note: this might be flaky if the test runs exactly at 59 minutes and 59 seconds of an hour and 999 milliseconds but should be unlikely
test('Only executes job once within time period', async () => {
    let counter = 0;
    const service = new JobService(store, config.getLogger);
    const job = service.singleInstance(
        'test',
        async () => {
            counter++;
        },
        60,
    );
    await job();
    await job();
    expect(counter).toBe(1);
    const jobs = await store.getAll();
    expect(jobs).toHaveLength(1);
    expect(jobs.every((j) => j.finishedAt !== null)).toBe(true);
    expect(jobs.every((j) => j.stage === 'completed')).toBe(true);
});

test('Will execute jobs with different keys', async () => {
    let counter = 0;
    let otherCounter = 0;
    const service = new JobService(store, config.getLogger);
    const incrementCounter = service.singleInstance(
        'one',
        async () => {
            counter++;
        },
        60,
    );
    const incrementOtherCounter = service.singleInstance(
        'two',
        async () => {
            otherCounter++;
        },
        60,
    );
    await incrementCounter();
    await incrementCounter();
    await incrementOtherCounter();
    await incrementOtherCounter();
    expect(counter).toBe(1);
    expect(otherCounter).toBe(1);
    const jobs = await store.getAll();
    expect(jobs).toHaveLength(2);
    expect(jobs.every((j) => j.finishedAt !== null)).toBe(true);
    expect(jobs.every((j) => j.stage === 'completed')).toBe(true);
});

test('When the provided function fails we record the failure', async () => {
    const service = new JobService(store, config.getLogger);
    const faultyJob = service.singleInstance(
        'will-fail',
        async () => {
            throw new Error('fail');
        },
        60,
    );
    await faultyJob();
    await faultyJob();
    const jobs = await store.getAll();
    expect(jobs).toHaveLength(1);
    expect(jobs.every((j) => j.finishedAt !== null)).toBe(true);
    expect(jobs.every((j) => j.stage === 'failed')).toBe(true);
});

test('backfills missing buckets and resumes from completed jobs', async () => {
    const service = new JobService(store, config.getLogger);
    const currentBucket = await store.getCurrentBucket(5);
    const ranges: Array<{ from: Date; to: Date }> = [];
    const job = service.singleInstanceWithBackfill(
        'backfill',
        async (range) => {
            ranges.push(range);
        },
        {
            getInitialDate: async () => subMinutes(currentBucket, 15),
            maxBucketsPerRun: 2,
        },
    );

    await job();
    expect(ranges).toHaveLength(2);
    expect(ranges[0]).toEqual({
        from: subMinutes(currentBucket, 15),
        to: subMinutes(currentBucket, 10),
    });

    await job();
    expect(ranges).toHaveLength(3);
    expect(ranges[2].to).toEqual(currentBucket);
    expect(
        (await store.getAll()).every((entry) => entry.stage === 'completed'),
    ).toBe(true);
});

test('starts with the current bucket when backfill is not configured', async () => {
    const service = new JobService(store, config.getLogger);
    const currentBucket = await store.getCurrentBucket(5);
    const ranges: Array<{ from: Date; to: Date }> = [];
    const job = service.singleInstanceWithBackfill(
        'current-only',
        async (range) => {
            ranges.push(range);
        },
    );

    await job();

    expect(ranges).toEqual([
        {
            from: subMinutes(currentBucket, 5),
            to: currentBucket,
        },
    ]);
});

test('retries a failed backfill bucket without advancing', async () => {
    const service = new JobService(store, config.getLogger);
    const currentBucket = await store.getCurrentBucket(5);
    let attempts = 0;
    const job = service.singleInstanceWithBackfill(
        'retry-backfill',
        async () => {
            attempts += 1;
            if (attempts === 1) {
                throw new Error('S3 unavailable');
            }
        },
        {
            getInitialDate: async () => subMinutes(currentBucket, 5),
            maxBucketsPerRun: 1,
        },
    );

    await job();
    expect((await store.getAll())[0].stage).toBe('failed');

    await job();
    expect(attempts).toBe(2);
    expect((await store.getAll())[0].stage).toBe('completed');
});

test('exhausts a permanently failing bucket and continues backfill', async () => {
    const error = vi.fn();
    const service = new JobService(store, () => ({
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error,
        fatal: vi.fn(),
    }));
    const currentBucket = await store.getCurrentBucket(5);
    let failingBucketAttempts = 0;
    let laterBucketAttempts = 0;
    const job = service.singleInstanceWithBackfill(
        'exhausted-backfill',
        async ({ to }) => {
            if (to < currentBucket) {
                failingBucketAttempts += 1;
                throw new Error('invalid payload');
            }
            laterBucketAttempts += 1;
        },
        {
            getInitialDate: async () => subMinutes(currentBucket, 10),
            maxAttempts: 2,
        },
    );

    await job();
    await job();

    expect(failingBucketAttempts).toBe(2);
    expect(laterBucketAttempts).toBe(1);
    expect(
        (
            await store.get({
                name: 'exhausted-backfill',
                bucket: subMinutes(currentBucket, 5),
            })
        ).stage,
    ).toBe('exhausted');
    expect(
        (
            await store.get({
                name: 'exhausted-backfill',
                bucket: currentBucket,
            })
        ).stage,
    ).toBe('completed');
    expect(error).toHaveBeenCalledWith(
        expect.stringContaining('exhausted 2/2 attempts'),
        expect.any(Error),
    );
});

test('recovers an abandoned backfill bucket after its lease expires', async () => {
    const bucket = await store.getCurrentBucket(5);

    expect(await store.acquireBucketAt('stale-backfill', bucket)).toBeDefined();
    expect(
        await store.acquireBucketAt('stale-backfill', bucket),
    ).toBeUndefined();

    await store.update('stale-backfill', bucket, {
        leaseExpiresAt: subMinutes(new Date(), 1),
    });

    expect(await store.acquireBucketAt('stale-backfill', bucket)).toBeDefined();
});

test('exhausts an abandoned bucket after its final attempt expires', async () => {
    const bucket = await store.getCurrentBucket(5);
    const acquired = await store.acquireBucketAt(
        'abandoned-final-attempt',
        bucket,
        { maxAttempts: 1 },
    );
    expect(acquired?.status).toBe('acquired');

    await store.update('abandoned-final-attempt', bucket, {
        leaseExpiresAt: subMinutes(new Date(), 1),
    });

    const exhausted = await store.acquireBucketAt(
        'abandoned-final-attempt',
        bucket,
        { maxAttempts: 1 },
    );
    expect(exhausted).toMatchObject({
        status: 'exhausted',
        job: { attemptCount: 1 },
    });
});
