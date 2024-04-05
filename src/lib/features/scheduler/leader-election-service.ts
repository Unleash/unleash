import { differenceInMinutes } from 'date-fns';
import type { Logger } from '../../server-impl';
import type { JobStore } from './job-store';
import type { LogProvider } from '../../logger';

export class LeaderElectionService {
    private jobStore: JobStore;
    private logger: Logger;
    constructor(jobStore: JobStore, logProvider: LogProvider) {
        this.jobStore = jobStore;
        this.logger = logProvider('/services/leader-election-service');
    }

    async executeOnLeader(
        key: string,
        fn: () => Promise<string>,
    ): Promise<string | undefined> {
        const lockAcquired = await this.jobStore.acquireLock(key);

        this.logger.info(`Lock acquired? ${lockAcquired}`);
        if (lockAcquired) {
            try {
                return await fn();
            } finally {
                await this.jobStore.releaseLock(key);
            }
        }
    }

    async onlyLeaderExecutes(
        key: string,
        fn: (lastCheckpoint?: string) => Promise<string>,
        releaseLockAfterMinutes = 15,
    ): Promise<unknown> {
        const lastExecution = await this.jobStore.getLastExecution(key);
        if (!lastExecution) {
            this.logger.info(`No previous execution for ${key}`);
            const checkpoint = await this.executeOnLeader(key, fn);
            this.logger.info(`Checkpoint returned by function ${checkpoint}`);
            if (checkpoint) {
                await this.jobStore.insert({
                    name: key,
                    checkpoint,
                    lastExecution: new Date(),
                });
            }
        } else {
            this.logger.info(
                `Last execution for ${key} was at ${lastExecution.lastExecution}`,
            );
            const checkpoint = await this.executeOnLeader(key, () =>
                fn(lastExecution.checkpoint),
            );
            if (checkpoint) {
                await this.jobStore.update(lastExecution?.id, {
                    name: key,
                    checkpoint,
                    lastExecution: new Date(),
                });
            }

            if (
                differenceInMinutes(lastExecution.lastExecution, new Date()) >
                releaseLockAfterMinutes
            ) {
                console.log('Releasing lock because of waiting too long');
                await this.jobStore.releaseLock(key);
            }
        }
        return await this.executeOnLeader(key, fn);
    }
}
