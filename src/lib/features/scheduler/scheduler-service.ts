import EventEmitter from 'events';
import { Logger, LogProvider } from '../../logger';
import MaintenanceService from '../../services/maintenance-service';
import { SCHEDULER_JOB_TIME } from '../../metric-events';

export class SchedulerService {
    private intervalIds: NodeJS.Timer[] = [];

    private logger: Logger;

    private maintenanceService: MaintenanceService;

    private eventBus: EventEmitter;

    constructor(
        getLogger: LogProvider,
        maintenanceService: MaintenanceService,
        eventBus: EventEmitter,
    ) {
        this.logger = getLogger('/services/scheduler-service.ts');
        this.maintenanceService = maintenanceService;
        this.eventBus = eventBus;
    }

    async schedule(
        scheduledFunction: () => void,
        timeMs: number,
        id: string,
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
                        await this.maintenanceService.isMaintenanceMode();
                    if (!maintenanceMode) {
                        await runScheduledFunctionWithEvent();
                    }
                } catch (e) {
                    this.logger.error(
                        `scheduled job failed | id: ${id} | ${e}`,
                    );
                }
            }, timeMs).unref(),
        );
        try {
            const maintenanceMode =
                await this.maintenanceService.isMaintenanceMode();
            if (!maintenanceMode) {
                await runScheduledFunctionWithEvent();
            }
        } catch (e) {
            this.logger.error(`scheduled job failed | id: ${id} | ${e}`);
        }
    }

    stop(): void {
        this.intervalIds.forEach(clearInterval);
    }
}
