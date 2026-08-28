import type { JobStore } from './job-store.js';
import type { Logger, LogProvider } from '../../logger.js';
import { addMinutes, subMinutes } from 'date-fns';

export class JobService {
    private jobStore: JobStore;
    private logger: Logger;
    constructor(jobStore: JobStore, logProvider: LogProvider) {
        this.jobStore = jobStore;
        this.logger = logProvider('/services/job-service');
    }

    /**
     * Wraps a function in a job that will guarantee the function is executed
     * in a mutually exclusive way in a single instance of the cluster, at most
     * once every {@param bucketSizeInMinutes}.
     *
     * The key identifies the job group: only one job in the group will execute
     * at any given time.
     *
     * Note: buckets begin at the start of the time span
     */
    public singleInstance(
        key: string,
        fn: (range?: { from: Date; to: Date }) => Promise<unknown>,
        bucketSizeInMinutes = 5,
    ): () => Promise<unknown> {
        return async () => {
            const acquired = await this.jobStore.acquireBucket(
                key,
                bucketSizeInMinutes,
            );

            if (acquired) {
                const result = await this.execute(
                    acquired,
                    fn,
                    bucketSizeInMinutes,
                );
                return result.response;
            }
        };
    }

    /**
     * Executes every missing time bucket, oldest first. Terminal rows in the
     * jobs table serve as both the distributed lock and the durable watermark.
     */
    public singleInstanceWithBackfill(
        key: string,
        fn: (range: { from: Date; to: Date }) => Promise<unknown>,
        {
            bucketSizeInMinutes = 5,
            maxBucketsPerRun = 24,
            maxAttempts = 5,
            getInitialDate,
        }: {
            bucketSizeInMinutes?: number;
            maxBucketsPerRun?: number;
            maxAttempts?: number;
            getInitialDate?: () => Promise<Date | undefined>;
        } = {},
    ): () => Promise<void> {
        if (maxAttempts < 1) {
            throw new Error('maxAttempts must be at least 1');
        }

        return async () => {
            const currentBucket =
                await this.jobStore.getCurrentBucket(bucketSizeInMinutes);
            const latestTerminalBucket =
                await this.jobStore.getLatestTerminalBucket(key);
            const initialDate = latestTerminalBucket
                ? undefined
                : await getInitialDate?.();
            let cursor =
                latestTerminalBucket ??
                (initialDate
                    ? this.floorToBucket(initialDate, bucketSizeInMinutes)
                    : subMinutes(currentBucket, bucketSizeInMinutes));

            for (let index = 0; index < maxBucketsPerRun; index += 1) {
                const bucket = addMinutes(cursor, bucketSizeInMinutes);
                if (bucket > currentBucket) {
                    return;
                }

                const acquired = await this.jobStore.acquireBucketAt(
                    key,
                    bucket,
                    { maxAttempts },
                );
                if (!acquired) {
                    return;
                }

                if (acquired.status === 'exhausted') {
                    this.logExhausted(acquired.job, maxAttempts);
                    cursor = bucket;
                    continue;
                }

                const result = await this.execute(
                    acquired.job,
                    fn,
                    bucketSizeInMinutes,
                    maxAttempts,
                );
                if (!result.succeeded && !result.exhausted) {
                    return;
                }
                cursor = bucket;
            }
        };
    }

    private floorToBucket(date: Date, bucketSizeInMinutes: number): Date {
        const bucketSizeInMilliseconds = bucketSizeInMinutes * 60 * 1_000;
        return new Date(
            Math.floor(date.getTime() / bucketSizeInMilliseconds) *
                bucketSizeInMilliseconds,
        );
    }

    private async execute(
        {
            name,
            bucket,
            attemptCount,
        }: { name: string; bucket: Date; attemptCount?: number },
        fn: (range: { from: Date; to: Date }) => Promise<unknown>,
        bucketSizeInMinutes: number,
        maxAttempts?: number,
    ): Promise<{
        succeeded: boolean;
        exhausted?: boolean;
        response?: unknown;
    }> {
        this.logger.debug(
            `Acquired job lock for ${name} from >= ${subMinutes(
                bucket,
                bucketSizeInMinutes,
            )} to < ${bucket}`,
        );
        try {
            const response = await fn({
                from: subMinutes(bucket, bucketSizeInMinutes),
                to: bucket,
            });
            await this.jobStore.update(name, bucket, {
                stage: 'completed',
                finishedAt: new Date(),
            });
            return { succeeded: true, response };
        } catch (err) {
            const exhausted = Boolean(
                maxAttempts && attemptCount && attemptCount >= maxAttempts,
            );
            if (exhausted) {
                this.logExhausted(
                    { name, bucket, attemptCount: attemptCount! },
                    maxAttempts!,
                    err,
                );
            } else {
                this.logger.error(`Failed to execute job ${name}`, err);
            }
            await this.jobStore.update(name, bucket, {
                stage: exhausted ? 'exhausted' : 'failed',
                finishedAt: new Date(),
            });
            return { succeeded: false, exhausted };
        }
    }

    private logExhausted(
        {
            name,
            bucket,
            attemptCount,
        }: {
            name: string;
            bucket: Date;
            attemptCount: number;
        },
        maxAttempts: number,
        error?: unknown,
    ): void {
        const message = `Job ${name} exhausted ${attemptCount}/${maxAttempts} attempts for bucket ${bucket.toISOString()}; skipping the bucket`;
        if (error) {
            this.logger.error(message, error);
        } else {
            this.logger.error(message);
        }
    }
}
