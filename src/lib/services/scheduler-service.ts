import { Logger, LogProvider } from '../logger';
import MaintenanceService from './maintenance-service';

export type SchedulerMode = 'active' | 'paused';

export class SchedulerService {
    private intervalIds: NodeJS.Timer[] = [];

    private mode: SchedulerMode;

    private logger: Logger;

    private maintenanceService: MaintenanceService;

    constructor(
        getLogger: LogProvider,
        maintenanceService: MaintenanceService,
    ) {
        this.logger = getLogger('/services/scheduler-service.ts');
        this.maintenanceService = maintenanceService;
        this.mode = 'active';
    }

    async schedule(
        scheduledFunction: () => void,
        timeMs: number,
        id: string,
    ): Promise<void> {
        this.intervalIds.push(
            setInterval(async () => {
                try {
                    const maintenanceMode =
                        await this.maintenanceService.isMaintenanceMode();
                    if (this.mode === 'active' && !maintenanceMode) {
                        await scheduledFunction();
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
            if (this.mode === 'active' && !maintenanceMode) {
                await scheduledFunction();
            }
        } catch (e) {
            this.logger.error(`scheduled job failed | id: ${id} | ${e}`);
        }
    }

    stop(): void {
        this.intervalIds.forEach(clearInterval);
    }

    pause(): void {
        this.mode = 'paused';
    }

    resume(): void {
        this.mode = 'active';
    }

    getMode(): SchedulerMode {
        return this.mode;
    }
}
