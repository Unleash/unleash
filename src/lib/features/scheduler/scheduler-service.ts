import type EventEmitter from 'events';
import type { Logger, LogProvider } from '../../logger.js';
import type { IMaintenanceStatus } from '../maintenance/maintenance-service.js';
import { SCHEDULER_JOB_TIME } from '../../metric-events.js';

// returns between min and max seconds in ms
// when schedule interval is smaller than max jitter then no jitter
function randomJitter(
    minMs: number,
    maxMs: number,
    scheduleIntervalMs: number,
): number {
    if (scheduleIntervalMs < maxMs) {
        return 0;
    }
    return Math.random() * (maxMs - minMs) + minMs;
}

export class SchedulerService {
    private intervalIds: NodeJS.Timeout[] = [];

    private inFlight: Set<Promise<void>> = new Set();

    private stopping = false;

    private logger: Logger;

    private maintenanceStatus: IMaintenanceStatus;

    private eventBus: EventEmitter;

    private executingSchedulers: Set<string> = new Set();

    constructor(
        getLogger: LogProvider,
        maintenanceStatus: IMaintenanceStatus,
        eventBus: EventEmitter,
    ) {
        this.logger = getLogger('/services/scheduler-service.ts');
        this.maintenanceStatus = maintenanceStatus;
        this.eventBus = eventBus;
    }

    async schedule(
        scheduledFunction: () => Promise<unknown>,
        timeMs: number,
        id: string,
        jitter = randomJitter(2 * 1000, 30 * 1000, timeMs),
    ): Promise<void> {
        if (this.stopping) {
            return;
        }

        const runScheduledFunctionWithEvent = (): Promise<void> => {
            if (this.stopping) {
                return Promise.resolve();
            }

            const promise = this.executeJob(scheduledFunction, id).catch(
                (error) => {
                    this.logger.error(
                        `Scheduled job failed | id: ${id}`,
                        error,
                    );
                },
            );

            this.inFlight.add(promise);
            void promise.then(
                () => this.inFlight.delete(promise),
                () => this.inFlight.delete(promise),
            );
            return promise;
        };

        // scheduled run
        this.intervalIds.push(
            setInterval(() => {
                void runScheduledFunctionWithEvent();
            }, timeMs).unref(),
        );

        // initial run with jitter
        if (jitter) {
            const timeoutId = setTimeout(() => {
                void runScheduledFunctionWithEvent();
            }, jitter);
            this.intervalIds.push(timeoutId);
        } else {
            await runScheduledFunctionWithEvent();
        }
    }

    private async executeJob(
        scheduledFunction: () => Promise<unknown>,
        id: string,
    ): Promise<void> {
        const maintenanceMode =
            await this.maintenanceStatus.isMaintenanceMode();
        if (
            this.stopping ||
            maintenanceMode ||
            this.executingSchedulers.has(id)
        ) {
            return;
        }

        this.executingSchedulers.add(id);
        const startTime = process.hrtime();
        try {
            await scheduledFunction();
        } finally {
            this.executingSchedulers.delete(id);
            const [seconds, nanoseconds] = process.hrtime(startTime);
            this.eventBus.emit(SCHEDULER_JOB_TIME, {
                jobId: id,
                time: seconds + nanoseconds / 1e9,
            });
        }
    }

    async stop(): Promise<void> {
        this.stopping = true;
        this.intervalIds.forEach(clearInterval);
        this.intervalIds = [];

        // Jobs cannot be safely canceled: callers must keep their dependencies
        // (especially the database) alive until every execution has settled.
        await Promise.allSettled([...this.inFlight]);
        this.executingSchedulers.clear();
    }
}
