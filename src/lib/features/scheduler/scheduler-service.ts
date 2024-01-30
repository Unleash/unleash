import EventEmitter from 'events';
import { Logger, LogProvider } from '../../logger';
import { IMaintenanceStatus } from '../maintenance/maintenance-service';
import { SCHEDULER_JOB_TIME } from '../../metric-events';

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
    return Math.random() * (maxMs - minMs + 1) + minMs;
}

export class SchedulerService {
    private intervalIds: NodeJS.Timeout[] = [];

    private logger: Logger;

    private maintenanceStatus: IMaintenanceStatus;

    private eventBus: EventEmitter;

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
        scheduledFunction: () => void,
        timeMs: number,
        id: string,
        jitter = randomJitter(2 * 1000, 30 * 1000, timeMs),
    ): Promise<void> {
        const runScheduledFunctionWithEvent = async () => {
            const startTime = process.hrtime();
            await scheduledFunction();
            const endTime = process.hrtime(startTime);

            // Process hrtime returns a list with two numbers representing high-resolution time.
            // The first number is the number of seconds, the second is the number of nanoseconds.
            // Since there are 1e9 (1,000,000,000) nanoseconds in a second, endTime[1] / 1e9 converts the nanoseconds to seconds.
            const durationInSeconds = endTime[0] + endTime[1] / 1e9;
            this.eventBus.emit(SCHEDULER_JOB_TIME, {
                jobId: id,
                time: durationInSeconds,
            });
        };

        this.intervalIds.push(
            setInterval(async () => {
                try {
                    const maintenanceMode =
                        await this.maintenanceStatus.isMaintenanceMode();
                    if (!maintenanceMode) {
                        await runScheduledFunctionWithEvent();
                    }
                } catch (e) {
                    this.logger.error(
                        `interval scheduled job failed | id: ${id}`,
                        e,
                    );
                }
            }, timeMs).unref(),
        );
        try {
            const maintenanceMode =
                await this.maintenanceStatus.isMaintenanceMode();

            if (!maintenanceMode) {
                if (jitter) {
                    setTimeout(() => {
                        runScheduledFunctionWithEvent();
                    }, jitter);
                } else {
                    await runScheduledFunctionWithEvent();
                }
            }
        } catch (e) {
            this.logger.error(`initial scheduled job failed | id: ${id}`, e);
        }
    }

    stop(): void {
        this.intervalIds.forEach(clearInterval);
    }
}
