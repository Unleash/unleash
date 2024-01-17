import { Logger, LogProvider } from '../../logger';
import { IMaintenanceStatus } from '../maintenance/maintenance-service';

export interface IStartupTask {
    shouldRun(): Promise<boolean>;
    run(): Promise<void>;
    stop(): Promise<void>;
}

interface IScheduledTask {
    timeout: NodeJS.Timeout;
    task: IStartupTask;
    id: string;
}

export class StartupTaskService {
    private tasks: Map<string, IScheduledTask> = new Map();

    private logger: Logger;

    private maintenanceStatus: IMaintenanceStatus;

    constructor(getLogger: LogProvider, maintenanceStatus: IMaintenanceStatus) {
        this.logger = getLogger('/services/startup-task-service.ts');
        this.maintenanceStatus = maintenanceStatus;
    }

    async scheduleStart(
        scheduledTask: IStartupTask,
        timeMs: number,
        id: string,
    ): Promise<void> {
        this.logger.info('Scheduling startup task');

        if (!scheduledTask.shouldRun()) {
            this.logger.info('Startup task not needed');
            return;
        }

        const timeoutRef = setTimeout(async () => {
            try {
                const maintenanceMode =
                    await this.maintenanceStatus.isMaintenanceMode();
                if (!maintenanceMode) {
                    if (!scheduledTask.shouldRun()) {
                        this.logger.info('Startup task not needed');
                        return;
                    }
                    await scheduledTask.run();
                    this.logger.info('Startup task completed');
                }
            } catch (e) {
                this.logger.error(`scheduled task failed | id: ${id} | ${e}`);
            }
        }, timeMs).unref();

        this.tasks.set(id, { timeout: timeoutRef, task: scheduledTask, id });
    }

    stop(): void {
        this.tasks.forEach((item) => {
            clearTimeout(item.timeout);
            item.task.stop();
        });
    }
}
