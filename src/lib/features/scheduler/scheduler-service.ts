import { Logger, LogProvider } from '../../logger';
import MaintenanceService from '../../services/maintenance-service';

export class SchedulerService {
    private intervalIds: NodeJS.Timer[] = [];

    private logger: Logger;

    private maintenanceService: MaintenanceService;

    constructor(
        getLogger: LogProvider,
        maintenanceService: MaintenanceService,
    ) {
        this.logger = getLogger('/services/scheduler-service.ts');
        this.maintenanceService = maintenanceService;
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
                    if (!maintenanceMode) {
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
            if (!maintenanceMode) {
                await scheduledFunction();
            }
        } catch (e) {
            this.logger.error(`scheduled job failed | id: ${id} | ${e}`);
        }
    }

    stop(): void {
        this.intervalIds.forEach(clearInterval);
    }
}
